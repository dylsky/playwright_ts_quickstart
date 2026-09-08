import { TestInfo } from "playwright/test";
import { BrowserContext } from "@playwright/test";
import path from "path";
import fs from "fs";
import {CustomLogger} from "../utils/common/CustomLogger";

const logger = CustomLogger.getLogger();

export class AllureReportingUtils {
    static async attachScreenshot(testInfo: TestInfo) {
        if (testInfo.status === "passed") return;

        const files = fs.readdirSync(testInfo.outputDir);
        const attachments: Array<{
            name: string;
            contentType: string;
            path?: string;
            body?: Buffer;
        }> = [];

        for (const file of files) {
            const fullPath = path.join(testInfo.outputDir, file);

            if (file.endsWith(".png")) {
                attachments.push({
                    name: "screenshot",
                    contentType: "image/png",
                    path: fullPath,
                });
            }
        }

        if (attachments.length > 0) {
            testInfo.attachments.push(...attachments);
        }
    }

    static async collectArtifacts(context: BrowserContext, testInfo: TestInfo) {
        if (context != null) {
            await AllureReportingUtils.attachScreenshot(testInfo);
        }
    }
}
