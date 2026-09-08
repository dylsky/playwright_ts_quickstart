import { allure } from "allure-playwright";
import fs from "fs";
import { test } from "@playwright/test";
import {CustomLogger} from "../utils/common/CustomLogger";

/**
 * Custom step wrapper that is able to attach custom logs part to the relevant step
 */
export async function step(title: string, fn: () => Promise<void>) {
    const logPath = CustomLogger.getCurrentFileName();
    const start = logPath && fs.existsSync(logPath) ? fs.statSync(logPath).size : 0;

    await test.step(title, async () => {
        try {
            await fn();
        } finally {
            try {
                if (!logPath || !fs.existsSync(logPath)) {
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 25));
                const end = fs.statSync(logPath).size;
                if (end > start) {
                    const fd = fs.openSync(logPath, "r");
                    try {
                        const buffer = Buffer.alloc(end - start);
                        fs.readSync(fd, buffer, 0, end - start, start);
                        const logChunk = buffer.toString("utf-8");
                        if (logChunk.trim()) {
                            await allure.attachment("step.log", logChunk, "text/plain");
                        }
                    } finally {
                        fs.closeSync(fd);
                    }
                }
            } catch (e) {
                // Fallback logic
                console.warn("Failed to attach log to the step:", (e as Error)?.message || e);
            }
        }
    });
}
