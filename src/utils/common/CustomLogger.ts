import fs from "fs";
import path from "path";
import winston from "winston";

export class CustomLogger {
    private static readonly LOG_DIR = path.resolve(process.cwd(), "logs");
    private static loggerInstance: winston.Logger | null = null;
    private static logFileName: string | null = null;

    private static format(level: string, message: string): string {
        const now = new Date();
        const ms = String(now.getMilliseconds()).padStart(3, "0");
        const datePart = now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }).replace(/,/g, "").replace(/\./g, "/");
        const timestamp = `${datePart}.${ms}`;
        return `[${timestamp}] ${level.toUpperCase()} ${message}`;
    }

    public static getLogger(): any {
        if (!CustomLogger.loggerInstance) {
            if (!fs.existsSync(CustomLogger.LOG_DIR)) {
                fs.mkdirSync(CustomLogger.LOG_DIR, { recursive: true });
            }
            CustomLogger.logFileName = `${Date.now()}.log`;
            const fullPath = path.join(CustomLogger.LOG_DIR, CustomLogger.logFileName);

            CustomLogger.loggerInstance = winston.createLogger({
                level: "debug",
                format: winston.format.printf(info => CustomLogger.format(String(info.level), String(info.message))),
                transports: [new winston.transports.Console(), new winston.transports.File({ filename: fullPath, tailable: true })],
            });
        }

        return {
            info: (msg: string) => CustomLogger.loggerInstance!.info(msg),
            error: (msg: string) => CustomLogger.loggerInstance!.error(msg),
            debug: (msg: string) => CustomLogger.loggerInstance!.debug(msg),
            warn: (msg: string) => CustomLogger.loggerInstance!.warn(msg),
        };
    }

    public static getCurrentFileName(): string | null {
        if (!CustomLogger.logFileName) return null;
        return path.join("logs", CustomLogger.logFileName);
    }
}
