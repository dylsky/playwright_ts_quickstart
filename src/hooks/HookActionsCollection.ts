import { BrowserContext, TestInfo } from "@playwright/test";
import fs from "fs";
import {CustomLogger} from "../utils/common/CustomLogger";
import {AllureReportingUtils} from "../reporting/AllureReportingUtils";

export type HookParameters = { context: BrowserContext; testInfo: TestInfo };

export interface ITestHookAction {
    execute(): Promise<void>;
}

abstract class BaseAction implements ITestHookAction {
    constructor(protected hookParameters?: HookParameters) {}
    abstract execute(): Promise<void>;
}

export class CollectArtifactsAction extends BaseAction {
    async execute(): Promise<void> {
        if (!this.hookParameters) {
            return;
        }
        await AllureReportingUtils.collectArtifacts(this.hookParameters.context, this.hookParameters.testInfo);

        try {
            const logPath = CustomLogger.getCurrentFileName();
            if (fs.existsSync(logPath!)) {
            }
        } catch (e) {
            console.warn("Failed to attach logs to the test (CollectArtifactsAction):", e?.message || e);
        }
    }
}
