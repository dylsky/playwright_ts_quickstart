import * as fs from "fs";
import path from "path";
import { parse } from "@fast-csv/parse";

export class ParsingUtils {
    public static getObjectFromJson<T>(path: string, initializer?: (data: any) => T): T {
        try {
            if (fs.existsSync(path)) {
                const jsonContent = fs.readFileSync(path, "utf8");
                const data = JSON.parse(jsonContent);

                if (initializer) {
                    return initializer(data);
                }
                return data as T;
            }
        } catch (e) {
            throw new Error(e);
        }
        throw new Error(`${path} not found`);
    }

    public static serializeObject<T>(object: T): any {
        return JSON.parse(JSON.stringify(object));
    }

    public static async readCsvFile(filePath: string, delimiter?: string): Promise<string[][]> {
        const absolutePath = path.resolve(filePath);

        return new Promise((resolve, reject) => {
            const rows: string[][] = [];

            fs.createReadStream(absolutePath)
                .pipe(
                    parse({
                        delimiter: delimiter || ",",
                        headers: false,
                        ignoreEmpty: true,
                    })
                )
                .on("data", (row: string[]) => rows.push(row))
                .on("error", reject)
                .on("end", () => resolve(rows));
        });
    }
}
