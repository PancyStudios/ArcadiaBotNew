declare global {
    interface Console {
        log(message: any, ...optionalParams: any[]): void;
        log(message: any, prefix:string | null | undefined): void;
        warn(message: any, prefix:string | null | undefined): void;
        debug(message: any, prefix:string | null | undefined): void;
        error(message: any, prefix:string | null | undefined): void;
    }    
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            enviroment: "dev" | "prod" | "debug";
            PORT: number;
            loggerlogWebhook: string;
            loggerErrorWebhook: string;
            globalModerationWebhook: string;
            
        }
    }
}

export {};