import {BasicPage} from "../core/layout/BasicPage";
import {Locator, Page} from "@playwright/test";

export class GoogleLanding extends BasicPage {
    searchArea: Locator;
    constructor(page: Page) {
        super(page, page.locator("[aria-label='Google']"));
        this.searchArea = page.locator("//textarea[@aria-autocomplete='both']")

    }
}