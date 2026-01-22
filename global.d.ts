declare global {
    interface Console {
        log(message: any, ...optionalParams: any[]): void;
        log(message: any, prefix?:string | null | undefined): void;
        warn(message: any, prefix?:string | null | undefined): void;
        debug(message: any, prefix?:string | null | undefined): void;
        error(message: any, prefix?:string | null | undefined): void;
    }    
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            enviroment: "dev" | "prod" | "debug";
            PORT: number;
            loggerlogWebhook: string;
            serverPort: number;
            loggerErrorWebhook: string;
            globalModerationWebhook: string;
            mongooseDbPassword: string;
            mongooseDbUrl: string
            ipMc: string;
            arcadiaPanelUrl: string;
            arcadiaPanelKey: string;
            channelConsole: string;
        }
    }
}

export {};