import { expect, type Locator } from "@playwright/test";

export class UniComponent {
    public componentLocator: Locator;

    constructor(locator?: Locator) {
        if (locator) {
            this.componentLocator = locator;
        }
    }

    async click() {
        await this.componentLocator.click();
    }

    async waitUntilAbsent(timeout: number = 5000) {
        await expect(this.componentLocator).toBeHidden({ timeout: timeout });
    }

    async waitUntilVisible(timeout: number = 5000): Promise<UniComponent> {
        await expect(this.componentLocator).toBeVisible({ timeout });
        return this;
    }
}
