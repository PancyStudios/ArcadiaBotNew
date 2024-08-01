
export class ErrorHandler {
    constructor() {
        process.on('uncaughtException', async (err, origin) => {
            console.error(err.message);
            console.error(origin);
        });
        process.on('unhandledRejection', async (reason, _promise) => {
            console.error(reason);
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.error(err.message);
            console.error(origin);

        });
        process.on('warning', async (warning) => {
            console.warn(warning.name);
            console.warn(warning.message);
            console.warn(warning.stack || 'No stack');
            console.warn(warning.cause || 'No cause');
        });
        console.log('AntiCrash listo');
    }
}