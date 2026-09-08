import { CustomLogger } from "./CustomLogger";
import { EnvVars, getEnvVar } from "../../core/GlobalEntities";

const logger = CustomLogger.getLogger();

export class WaitUtils {
    static async wait(seconds: number): Promise<void> {
        if (seconds >= 1) {
            logger.debug(`Waiting ${seconds} seconds`);
        }
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    static getTimeoutAndConvertToSeconds(timeout: number | undefined): number {
        if (timeout != null && timeout < 300) {
            return timeout * 1000;
        } else return parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT) ?? "15000");
    }
}
