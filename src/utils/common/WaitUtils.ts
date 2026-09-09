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

    /**
     * Returns a timeout in milliseconds.
     * If the provided value is less than 300 it is assumed to be in seconds and converted to ms;
     * otherwise the global timeout from environment variables is used.
     */
    static getTimeoutMs(timeout: number | undefined): number {
        if (timeout != null && timeout < 300) {
            return timeout * 1000;
        }
        return parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT), 10);
    }
}
