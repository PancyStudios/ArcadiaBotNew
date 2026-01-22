import { Client as DiscordClient, GatewayIntentBits, TextChannel } from 'discord.js';
import WebSocket from 'ws';

interface MinecraftConsoleOptions {
	panelUrl: string;
	apiKey: string;
	serverUuid: string;
	discordClient: DiscordClient;
	channelId: string;
	maxBufferChars?: number;
	forceSendIntervalMs?: number;
}

interface WebSocketMessage {
	event: string;
	args?: any[];
}

export class MinecraftConsole {
	private options: Required<MinecraftConsoleOptions>;
	private consoleBuffer: string = '';
	private lastSentTime: number = Date.now();
	private discordChannel: TextChannel | null = null;
	private ws: WebSocket | null = null;
	private socketUrl: string | null = null;
	private currentToken: string | null = null;
	private reconnectTimer: NodeJS.Timeout | null = null;

	constructor(options: MinecraftConsoleOptions) {
		this.options = {
			maxBufferChars: 1750,
			forceSendIntervalMs: 15000,
			...options,
		};

		this.options.discordClient.once('ready', () => {
			const channel = this.options.discordClient.channels.cache.get(this.options.channelId);
			if (channel instanceof TextChannel) {
				this.discordChannel = channel;
				console.log(`[MinecraftConsole] Canal encontrado: #${channel.name}`);
				this.start();
			} else {
				console.error('[MinecraftConsole] Canal no válido:', this.options.channelId);
			}
		});
	}

	private async fetchWebSocketDetails(): Promise<boolean> {
		try {
			const response = await fetch(
				`${this.options.panelUrl}/api/client/servers/${this.options.serverUuid}/websocket`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${this.options.apiKey}`,
						Accept: 'Application/vnd.pterodactyl.v1+json',
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);

			const json = await response.json() as { data: { socket: string; token: string } };
			this.socketUrl = json.data.socket;
			this.currentToken = json.data.token;

			console.log('[MinecraftConsole] Token y URL WS frescos obtenidos');
			return true;
		} catch (err) {
			console.error('[MinecraftConsole] Error fetching WS:', (err as Error).message);
			return false;
		}
	}

	private connectWebSocket(): void {
		if (this.ws) {
			this.ws.removeAllListeners();
			this.ws.close();
			this.ws = null;
		}

		if (!this.socketUrl || !this.currentToken) {
			this.fetchWebSocketDetails().then(success => {
				if (success) this.connectWebSocket();
				else setTimeout(() => this.connectWebSocket(), 30000);
			});
			return;
		}

		console.log('[MinecraftConsole] Conectando a:', this.socketUrl);

		this.ws = new WebSocket(this.socketUrl, {
			origin: this.options.panelUrl,
		});

		this.ws.on('open', () => {
			console.log('[MinecraftConsole] WS abierto → auth enviada');
			this.ws!.send(JSON.stringify({ event: 'auth', args: [this.currentToken] }));
		});

		this.ws.on('message', (data: WebSocket.RawData) => {
			try {
				const msg = JSON.parse(data.toString()) as WebSocketMessage;

				if (msg.event === 'console output' && msg.args?.[0]) {
					const line: string = msg.args[0];
					const cleanLine = line.replace(/§[0-9a-fk-or]/gi, '');

					if (cleanLine.includes('[Memory Manager] [Cyclic Garbage Collector]')) return;

					this.consoleBuffer += cleanLine + '\n';

					if (this.consoleBuffer.length + 20 >= this.options.maxBufferChars) {
						this.sendBuffer();
					}
				} else if (msg.event === 'auth success') {
					console.log('[MinecraftConsole] Auth exitosa');
				} else if (msg.event === 'token expiring') {
					console.warn('[MinecraftConsole] Token expiring detectado → refrescando automáticamente');
					this.handleTokenExpiring();
				} else if (msg.event === 'token expired') {
					console.warn('[MinecraftConsole] Token expired → reconectando');
					this.handleTokenExpiring();
				} else if (msg.event === 'stats') {
					// Opcional: maneja stats
				}
			} catch (err) {
				console.error('[MinecraftConsole] Error parseando WS msg:', err);
			}
		});

		this.ws.on('error', (err: Error) => {
			console.error('[MinecraftConsole] WS error:', err.message);
			this.scheduleReconnect();
		});

		this.ws.on('close', () => {
			console.log('[MinecraftConsole] WS cerrado → reconectando');
			this.scheduleReconnect();
		});
	}

	private async handleTokenExpiring(): Promise<void> {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		const success = await this.fetchWebSocketDetails();
		if (success) {
			this.connectWebSocket();
		} else {
			console.log('[MinecraftConsole] Falló refresh, reintento en 30s');
			setTimeout(() => this.handleTokenExpiring(), 30000);
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.reconnectTimer = setTimeout(() => this.connectWebSocket(), 5000);
	}

	private async sendBuffer(): Promise<void> {
		if (!this.consoleBuffer.trim() || !this.discordChannel) return;

		const content = '```ansi\n' + this.consoleBuffer.trim() + '\n```';

		try {
			await this.discordChannel.send(content);
			console.log(`[MinecraftConsole] Enviado: ${this.consoleBuffer.length} chars`);
			this.lastSentTime = Date.now();
		} catch (err) {
			console.error('[MinecraftConsole] Error Discord:', (err as Error).message);
			if ((err as any)?.message?.includes('2000') || (err as any)?.code === 50035) {
				const chunks = this.splitIntoChunks(this.consoleBuffer, 900);
				for (const chunk of chunks) {
					if (chunk.trim()) {
						await this.discordChannel.send('```ansi\n' + chunk.trim() + '\n```').catch(console.error);
						await new Promise(r => setTimeout(r, 1200));
					}
				}
			}
		}

		this.consoleBuffer = '';
	}

	private splitIntoChunks(text: string, maxLen: number): string[] {
		const chunks: string[] = [];
		let start = 0;
		while (start < text.length) {
			let end = start + maxLen;
			const nl = text.lastIndexOf('\n', end);
			if (nl > start) end = nl;
			chunks.push(text.slice(start, end));
			start = end + 1;
		}
		return chunks;
	}

	public start(): void {
		this.connectWebSocket();

		// Envío forzado cada X segundos
		setInterval(() => {
			if (this.consoleBuffer.trim() && Date.now() - this.lastSentTime >= this.options.forceSendIntervalMs) {
				this.sendBuffer();
			}
		}, this.options.forceSendIntervalMs);
	}

	public stop(): void {
		if (this.ws) this.ws.close();
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		console.log('[MinecraftConsole] Detenido');
	}
}