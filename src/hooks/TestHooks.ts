import { HookAction } from "./HookAction";
import { HookParameters } from "./HookActionsCollection";
import { HookRegistry } from "./HooksRegistry";
import { expect } from "@playwright/test";
import {CustomLogger} from "../utils/common/CustomLogger";

const logger = CustomLogger.getLogger();

export class TestHooks {
    private static readonly endActions = new Set<HookAction>([HookAction.COLLECT_ARTIFACTS]);

    static async setup(hookParameters: HookParameters, actions: HookAction[] = []) {
        logger.info("**************************** Starting scenario ****************************");
        if (hookParameters?.testInfo) {
            const fs = require("fs");
            fs.writeFileSync(`logs/logfile_${hookParameters.testInfo.testId}.meta`, CustomLogger.getCurrentFileName());
        }
        const hadErrorsDuringSetup = await this.runPreservingOrder(hookParameters, actions);
        expect(hadErrorsDuringSetup, "Error during stest setup").toBeFalsy();
        logger.info("**************************** Ready to start test case ****************************");
    }

    static async teardown(hookParameters: HookParameters, actions: HookAction[] = []) {
        logger.info("**************************** Test finished ****************************");
        await this.runPreservingOrder(hookParameters, actions);
        logger.info("**************************** Environment has been clean up ****************************");
    }

    private static async runPreservingOrder(hookParameters: HookParameters, actions: HookAction[]) {
        let hadErrors: boolean = false;
        for (const action of actions) {
            if (!this.endActions.has(action)) {
                const result = await this.executeAction(hookParameters, action);
                if (result) hadErrors = true;
            }
        }
        for (const action of actions) {
            if (this.endActions.has(action)) {
                const result = await this.executeAction(hookParameters, action);
                if (result) hadErrors = true;
            }
        }

        return hadErrors;
    }

    private static async executeAction(hookParameters: HookParameters, action: HookAction) {
        let hadErrors: boolean = false;
        try {
            const actionConstructor = HookRegistry.resolve(action);
            const instance = new actionConstructor(hookParameters);
            await instance.execute();
        } catch (err) {
            logger.error(`[HOOK] Error during action: ${action}: ${(err as Error).message}`);
            hadErrors = true;
        }
        return hadErrors;
    }
}
