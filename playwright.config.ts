import * as fs from "fs";

fs.mkdirSync("logs", { recursive: true });

import { CustomLogger } from "./src/utils/common/CustomLogger";
CustomLogger.getLogger();

import { defineConfig } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    timeout: 5 * 60 * 1000,
    expect: {
        timeout: 15_000,
    },
    testDir: "./tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 3 : 1,
    reporter: process.env.CI
        ? [["line"], ["allure-playwright", { open: "never", detail: false }]]
        : [
            ["html", { open: "never" }],
            ["allure-playwright", { open: "never", detail: false }],
        ],
    use: {
        actionTimeout: 15 * 1000,
        navigationTimeout: 60 * 1000,
        // Traces weight ~15 mb
        trace: "off",
        headless: false,
        launchOptions: {
            args: ["--start-maximized"],
        },
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: {
                browserName: "chromium",
                viewport: process.env.CI ? { width: 1920, height: 1080 } : null,
                permissions: ["microphone"],
                launchOptions: {
                    args: [
                        "--start-maximized",
                        // Settings for webcam/webrtc
                        "--use-fake-device-for-media-stream",
                        "--use-fake-ui-for-media-stream",
                        "--use-file-for-fake-audio-capture=src/testData/audio/borsch.wav",
                    ],
                },
            },
        },
    ],
});
