import { type Locator } from "@playwright/test";

export class RowElement {
    private readonly _rootElement: Locator;

    constructor(rootElement: Locator) {
        this._rootElement = rootElement;
    }

    get rootElement(): Locator {
        return this._rootElement;
    }
}
