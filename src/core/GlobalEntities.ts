import dotenv from "dotenv";

export class GlobalEntities {
    private static instance: GlobalEntities;
    propertiesMap: Map<string, unknown> = new Map();

    private constructor() {}

    static getInstance(): GlobalEntities {
        if (this.instance === null || this.instance === undefined) {
            this.instance = new GlobalEntities();
        }

        return this.instance;
    }

    public addProp(key: string, value: unknown) {
        this.propertiesMap.set(key, value);
    }

    public popProp(key: string): unknown {
        const obj = this.propertiesMap.get(key);
        this.propertiesMap.delete(key);
        return obj;
    }
}

export enum Props {
}

export function getEnvVar(varname: EnvVars): string {
    if (!process.env.DOTENV_LOADED) {
        dotenv.config();
        process.env.DOTENV_LOADED = "true";
    }

    const value = process.env[varname];
    if (!value) {
        throw new Error(`${varname} is not defined`);
    }
    return value;
}

export enum EnvVars {
    GLOBAL_TIMEOUT = "GLOBAL_TIMEOUT",
}
