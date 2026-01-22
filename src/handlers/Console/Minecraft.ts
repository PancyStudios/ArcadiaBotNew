import { TextChannel } from 'discord.js';
import { ExtendedClient } from "../../structures/Client";
import WebSocket from 'ws';

interface MinecraftConsoleOptions {
	panelUrl: string;
	apiKey: string;
	serverUuid: string;
	discordClient: ExtendedClient;
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
	private readonly codeBlockPrefix = '```ansi\n';
	private readonly codeBlockSuffix = '\n```';
	private readonly discordHardLimit = 890;
	private safeChunkSize!: number;
	private isSending = false;
	private pendingFlush = false;

	constructor(options: MinecraftConsoleOptions) {
		this.options = {
			maxBufferChars: 890,
			forceSendIntervalMs: 15000,
			...options,
		};

		const channel = this.options.discordClient.channels.cache.get(this.options.channelId);
		if (channel instanceof TextChannel) {
			this.discordChannel = channel;
			console.log(`[MinecraftConsole] Canal encontrado: #${channel.name}`);
			this.safeChunkSize = Math.min(
				this.options.maxBufferChars,
				this.discordHardLimit - this.codeBlockPrefix.length - this.codeBlockSuffix.length - 50,
			);
			this.start();
		} else {
			console.error('[MinecraftConsole] Canal no válido:', this.options.channelId);
		}
	};

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

			console.log('Token y URL WS frescos obtenidos', '[MinecraftConsole]');
			return true;
		} catch (err) {
			console.error('Error fetching WS: ' + (err as Error).message), '[MinecraftConsole]' ;
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

		console.log('Conectando a: ' + this.socketUrl, '[MinecraftConsole]');

		this.ws = new WebSocket(this.socketUrl, {
			origin: this.options.panelUrl,
		});

		this.ws.on('open', () => {
			console.log('WS abierto → auth enviada', '[MinecraftConsole]');
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
					console.log('Auth exitosa', '[MinecraftConsole]');
				} else if (msg.event === 'token expiring') {
					console.warn('Token expiring detectado → refrescando automáticamente','[MinecraftConsole]');
					this.handleTokenExpiring();
				} else if (msg.event === 'token expired') {
					console.warn('Token expired → reconectando', '[MinecraftConsole]');
					this.handleTokenExpiring();
				} else if (msg.event === 'stats') {
					// Opcional: maneja stats
				}
			} catch (err) {
				console.error('Error parseando WS msg:', '[MinecraftConsole] ');
			}
		});

		this.ws.on('error', (err: Error) => {
			console.error('WS error:' + err.message, '[MinecraftConsole]');
			this.scheduleReconnect();
		});

		this.ws.on('close', () => {
			console.log('WS cerrado → reconectando', "[MinecraftConsole]");
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
			console.log('Falló refresh, reintento en 30s', "[MinecraftConsole] ");
			setTimeout(() => this.handleTokenExpiring(), 30000);
		}
	}

	private scheduleReconnect(): void {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.reconnectTimer = setTimeout(() => this.connectWebSocket(), 5000);
	}

	private async sendBuffer(force: boolean = false): Promise<void> {
		if (this.isSending) {
			this.pendingFlush = true;
			return;
		}

		if (!this.consoleBuffer.trim() || !this.discordChannel) return;

		this.isSending = true;

		try {
			while (this.consoleBuffer.trim().length > 0 && (force || this.consoleBuffer.length >= this.safeChunkSize)) {
				const chunk = this.nextChunk();
				if (!chunk) break;

				try {
					await this.discordChannel.send(this.codeBlockPrefix + chunk + this.codeBlockSuffix);
					this.lastSentTime = Date.now();
				} catch (err) {
					console.error('Error Discord:' + (err as Error).message, '[MinecraftConsole]');
					if (this.safeChunkSize > 500) {
						this.safeChunkSize = Math.max(500, Math.floor(this.safeChunkSize / 2));
						this.consoleBuffer = chunk + '\n' + this.consoleBuffer;
						continue;
					}
					break;
				}
			}
		} finally {
			this.isSending = false;
			if (this.pendingFlush) {
				this.pendingFlush = false;
				await this.sendBuffer(true);
			}
		}
	}

	private nextChunk(): string | null {
		if (!this.consoleBuffer.trim()) return null;

		const limit = this.safeChunkSize;
		let slice = this.consoleBuffer.slice(0, limit);
		const lastNl = slice.lastIndexOf('\n');
		if (lastNl > Math.floor(limit * 0.6)) slice = slice.slice(0, lastNl);

		this.consoleBuffer = this.consoleBuffer.slice(slice.length);
		this.consoleBuffer = this.consoleBuffer.replace(/^\n+/, '');

		return slice.trimEnd();
	}

	public start(): void {
		this.connectWebSocket();

		// Envío forzado cada X segundos
		setInterval(() => {
			if (this.consoleBuffer.trim() && Date.now() - this.lastSentTime >= this.options.forceSendIntervalMs) {
				this.sendBuffer(true);
			}
		}, this.options.forceSendIntervalMs);
	}

	public stop(): void {
		if (this.ws) this.ws.close();
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		console.log('[MinecraftConsole] Detenido');
	}
}