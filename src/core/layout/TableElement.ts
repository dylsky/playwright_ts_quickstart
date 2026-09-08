import { expect, type Locator, Page } from "@playwright/test";
import { RowElement } from "./RowElement";
import { CustomLogger } from "../../utils/common/CustomLogger";
import waitUntil from "async-wait-until";
import { EnvVars, getEnvVar } from "../GlobalEntities";
import {BasicPage} from "./BasicPage";

const normalize = (str: string): string => str.normalize("NFKD");
const logger = CustomLogger.getLogger();

export abstract class TableElement {
    protected rowLocator: string;
    protected readonly _rootElement: Locator;

    protected constructor(rootElement: Locator) {
        this._rootElement = rootElement;
    }

    public abstract getRow(searchTerm: string | number): Promise<unknown>;

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    public abstract getRows(): Promise<Array<any>>;

    public async isVisible(timeout?: number): Promise<boolean> {
        return this._rootElement.isVisible({ timeout });
    }

    public async getRowCount(): Promise<number> {
        try {
            return await this._rootElement.locator(this.rowLocator).count();
        } catch {
            return 0;
        }
    }

    public async refreshUntilVisible(
        timeout: number = parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT) ?? "10000"),
        intervalBetweenAttempts: number = 250
    ): Promise<void> {
        await waitUntil(
            async () => {
                try {
                    await this.waitUntilVisible();
                    return true;
                } catch {
                    logger.warn("Table was not visible, reloading");
                    await this._rootElement.page().reload();
                    return false;
                }
            },
            { timeout, intervalBetweenAttempts }
        );
    }

    async refreshUntilThereAreRecordsWithAllFields(criteriaList: Array<{ [field: string]: string | RegExp }>) {
        await waitUntil(
            async () => {
                const allFound = await Promise.all(
                    criteriaList.map(async criteria => {
                        const found = await this.isRowPresent(criteria);
                        if (!found) {
                            logger.info(`Entry was not found via following search criteria: ${JSON.stringify(criteria)}`);
                        }
                        return found;
                    })
                );
                if (allFound.every(Boolean)) {
                    logger.info("Record found");
                    return true;
                }
                logger.warn("Entry was not found, reloading");
                await this._rootElement.page().reload();
                return false;
            },
            { timeout: 90000, intervalBetweenAttempts: 5000 }
        );
    }

    public async waitUntilVisible(timeout?: number): Promise<any> {
        const resolvedTimeout = timeout ?? parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT));

        await waitUntil(async () => (await this.getRows()).length > 0, {
            timeout: resolvedTimeout,
            intervalBetweenAttempts: 250,
        });
        await (await this.getRows())[0].rootElement.click({ trial: true });
        return this;
    }

    public async waitUntilAbsent(): Promise<void> {
        await waitUntil(async () => (await this.getRows()).length === 0, {
            timeout: parseInt(getEnvVar(EnvVars.GLOBAL_TIMEOUT) ?? "10000"),
            intervalBetweenAttempts: 250,
        });
    }

    async checkRowPresenceWithRetry(page: Page, searchCriteria: { [field: string]: string | RegExp }, attempts: number = 3): Promise<boolean> {
        let isPresent: boolean = false;
        for (let attempt = 0; attempt < attempts; attempt++) {
            try {
                await this.waitUntilVisible();
                isPresent = await this.isRowPresent(searchCriteria);
                if (isPresent) {
                    return true;
                }
            } catch (error) {
                console.error(`Attempt ${attempt + 1} failed:`, error);
            }

            await BasicPage.reload(page);
        }

        return false;
    }

    public async isRowPresent(searchCriteria: { [field: string]: string | RegExp }) {
        const rows = await this.getRows();
        for (const row of rows) {
            let allMatch = true;

            for (const [field, term] of Object.entries(searchCriteria)) {
                const textContent = await row[field].textContent();
                let actualText = textContent?.trim() ?? "";

                if (actualText === "") {
                    const value = await row[field].inputValue();
                    actualText = value?.trim() ?? "";
                }

                const matches = typeof term === "string" ? normalize(actualText) === normalize(term) : term.test(normalize(actualText));

                if (!matches) {
                    logger.info(`Didn't match:\nExpected value: ${term}\nActual value: ${normalize(actualText)}`);
                    allMatch = false;
                    break;
                }
            }

            if (allMatch) {
                return true;
            }
        }

        return false;
    }

    public async assertRowPresence(searchCriteria: { [field: string]: string | RegExp }) {
        const result = await this.isRowPresent(searchCriteria);
        expect(result, `Entry was not found via following search criteria: ${JSON.stringify(searchCriteria)}`).toBe(true);
    }

    public async assertRowAbsence(searchCriteria: { [field: string]: string | RegExp }) {
        const result = await this.isRowPresent(searchCriteria);
        expect(result, `Entry was found via following search criteria:: ${JSON.stringify(searchCriteria)}`).toBe(false);
    }

    public async getRowOfClass<T extends RowElement>(searchField: any, searchTerm: string | number): Promise<T> {
        logger.info(
            `Searching row with ${typeof searchTerm === "number" ? "index" : "text"} '${searchTerm}' in table ${this.constructor.name}, searching by filed '${searchField}'`
        );
        if (typeof searchTerm === "string") {
            for (const row of await this.getRows()) {
                const isPresent = await row[searchField].isVisible().catch(() => false);
                if (!isPresent) continue;
                const actualText = await this.getActualText(row[searchField]);
                if (normalize(actualText) === normalize(searchTerm)) {
                    return row;
                }
            }
            throw new Error(`Entry '${searchTerm}' was not found in table ${this.constructor.name}`);
        } else {
            const localRows = await this.getRows();
            if (localRows.length - 1 < searchTerm) {
                throw new Error(`Entry ${searchTerm} was not found in table ${this.constructor.name}.\nTotal entries: ${localRows.length}`);
            }
            return localRows[searchTerm];
        }
    }

    protected async getRowsOfClass<T extends RowElement>(type: { new (arg: any): T }): Promise<Array<T>> {
        try {
            await expect(this._rootElement.locator(`${this.rowLocator} >> nth=0`)).toBeVisible();
        } catch {
            logger.info(`No elements matching locator ${this.rowLocator} found`);
        }

        return (await this._rootElement.locator(this.rowLocator).all()).map(x => new type(x));
    }

    private async getActualText(element: { textContent(): Promise<string | null>; inputValue(): Promise<string | null> }): Promise<string> {
        const textContentRaw = await element.textContent();
        let actualText = textContentRaw?.trim() ?? "";

        if (actualText === "") {
            const valueRaw = await element.inputValue();
            actualText = valueRaw?.trim() ?? "";
        }

        return actualText;
    }
}
