import {test} from "../fixture/GenericFixture";
import {step} from "../../src/hooks/CustomStep";
import {WaitUtils} from "../../src/utils/common/WaitUtils";

test("[ID-00001] Entering text", { tag: ["@example"]}, async ({page, googleLanding, context}) => {
    await step("Opening page", async () => {
        await googleLanding.goto("http://google.com");
        await googleLanding.onPage()
    })

    await step("Entering search criteria", async () => {
        await googleLanding.searchArea.pressSequentially("Hey boss")
        await googleLanding.searchArea.press("Enter")
    })

    await step("Checking navigation", async () => {
        await WaitUtils.wait(10)
    })
})