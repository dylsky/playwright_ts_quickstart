import { type Locator, type Page } from "@playwright/test";
import { WaitUtils } from "../../utils/common/WaitUtils";
import { EnvVars, getEnvVar } from "../GlobalEntities";

export class BasicPage {
    public page: Page;
    public pageLocator: Locator;

    protected constructor(page: Page, pageLocator?: Locator) {
        this.page = page;
        if (pageLocator) this.pageLocator = pageLocator;
    }

    public async onPage(timeout?: number): Promise<BasicPage> {
        if (timeout === undefined) timeout = 15000;
        await this.pageLocator.waitFor({ state: "visible", timeout: timeout });
        await WaitUtils.wait(0.25);
        return this;
    }

    locatorFromTemplate(template: string, value: string, toReplace: string = "%s") {
        return this.pageLocator.locator(template.replace(toReplace, value));
    }

    public async goto(location: string | URL, timeout?: number): Promise<void> {
        let normalizedLocation: string;
        if (location instanceof URL) normalizedLocation = location.toString();
        else normalizedLocation = location;
        await this.page.goto(normalizedLocation, { waitUntil: "domcontentloaded", timeout: timeout ?? parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT)) });
    }

    public async reload(timeout?: number) {
        await this.page.reload({ waitUntil: "domcontentloaded", timeout: timeout ?? parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT)) });
    }

    public async goBack(timeout?: number) {
        await this.page.goBack({ timeout: timeout ?? parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT)), waitUntil: "domcontentloaded" });
    }

    public async waitForUrl(url: string) {
        await this.page.waitForURL(url, { waitUntil: "domcontentloaded" });
    }
}
