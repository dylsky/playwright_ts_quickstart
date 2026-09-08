import { test as testCore } from "@playwright/test";

import { config } from "dotenv";
import {TestHooks} from "../../src/hooks/TestHooks";
import {HookAction} from "../../src/hooks/HookAction";
import {GoogleLanding} from "../../src/googleLayoutExample/GoogleLanding";

config();
testCore.use({
    ignoreHTTPSErrors: true,
});

type GenericFixture = {
    googleLanding: GoogleLanding;
    testHook: void;
};

export const test = testCore.extend<GenericFixture>({
    googleLanding: async ({ page }, use) => {
        await use(new GoogleLanding(page));
    },
    testHook: [
        async ({ context }, use, testInfo) => {
            await TestHooks.setup({ context, testInfo }, []);
            await use();
            await TestHooks.teardown({ context, testInfo }, [
                HookAction.COLLECT_ARTIFACTS,
            ]);
        },
        { auto: true },
    ],
});
