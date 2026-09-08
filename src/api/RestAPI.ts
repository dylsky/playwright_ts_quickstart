import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import {CustomLogger} from "../utils/common/CustomLogger";
import {ParsingUtils} from "../utils/files/ParsingUtils";

const logger = CustomLogger.getLogger();

// noinspection DuplicatedCode
export class RestAPI {
    public static AUTH_COOKIE: string = "s";
    private static REST_API_ENDPOINT: string = "/api/v2/";
    private static USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
    public baseURL: URL;

    private async requestWithLog(config: AxiosRequestConfig, label: string, nonVerbose: boolean = false): Promise<AxiosResponse> {
        const response = await axios.request(config);

        if (nonVerbose) {
            logger.info(`${label} ${config.url} → ${response.status} ${response.statusText}`);
            return response;
        }

        const parts: string[] = [`\nMethod: ${label}`, `URL: ${config.url}`, `Headers:\n${JSON.stringify(config.headers, null, 4)}`];

        if (config.data) {
            parts.push("───────────────────────────────────────────────");
            parts.push(`Request Body:\n${JSON.stringify(config.data, null, 4)}`);
        }

        parts.push("───────────────────────────────────────────────");
        parts.push(`Response: ${response.status} ${response.statusText}`);
        parts.push(`Response Body:\n${JSON.stringify(response.data, null, 4)}`);
        parts.push("───────────────────────────────────────────────\n");

        logger.info(parts.join("\n"));
        return response;
    }

    public constructor(baseUrl: URL, apiEndpoint?: string) {
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            if (apiEndpoint) {
                this.baseURL = new URL(baseUrl.protocol + baseUrl.host + apiEndpoint);
            } else {
                this.baseURL = new URL(baseUrl.protocol + baseUrl.host + RestAPI.REST_API_ENDPOINT);
            }

    }

    static formHttpsUrl(endpoint: string): URL {
        return new URL("https://" + endpoint);
    }

    static formHttpUrl(endpoint: string): URL {
        return new URL("http://" + endpoint);
    }

    static serializeQuery(queryParams: Map<string, any>): string {
        const entries = Array.from(queryParams.entries());
        const result = entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        return result.join("&");
    }

    public async get(method: string, queryParams: Record<string, string>, token: string | null, nonVerbose?: boolean): Promise<AxiosResponse> {
        const endpoint =
            `${this.baseURL.toString()}${method}` + (Object.entries(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : "");
        const config: AxiosRequestConfig = {
            method: "get",
            url: endpoint,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Cookie: token ? `${token}` : undefined,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "GET", nonVerbose);
    }

    public async getFormUrlEncoded(method: string, queryParams: Record<string, string>, token: string | null, nonVerbose?: boolean): Promise<AxiosResponse> {
        const endpoint =
            `${this.baseURL.toString()}${method}` + (Object.entries(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : "");
        const headers = { "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" };
        const config: AxiosRequestConfig = {
            method: "get",
            url: endpoint,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Cookie: token ? `${token}` : undefined,
                ...headers,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "FORM-GET", nonVerbose);
    }

    public async post(method: string, body: Map<string, any>, token: string | null, nonVerbose?: boolean): Promise<AxiosResponse> {
        const payload = ParsingUtils.serializeObject(Object.fromEntries(body));
        const config: AxiosRequestConfig = {
            method: "post",
            url: this.baseURL.toString() + method,
            data: payload,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                "Content-Type": "application/json; charset=UTF-8",
                Cookie: token ? `${token}` : undefined,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "POST", nonVerbose);
    }

    public async postJson(method: string, body: JSON | null, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "post",
            url: this.baseURL.toString() + method,
            data: body,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                "Content-Type": "application/json; charset=UTF-8",
                Cookie: token ? `${token}` : undefined,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "POST", nonVerbose);
    }

    public async putJson(method: string, body: JSON | null, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "put",
            url: this.baseURL.toString() + method,
            data: body,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                "Content-Type": "application/json; charset=UTF-8",
                Cookie: token ? `${token}` : undefined,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "PUT", nonVerbose);
    }

    public async delete(method: string, token: string): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "delete",
            url: this.baseURL.toString() + method,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Cookie: token ? `${token}` : undefined,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "DELETE", false);
    }

    public async postJsonWithBearerToken(method: string, body: JSON, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "post",
            url: this.baseURL.toString() + method,
            data: body,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json; charset=UTF-8",
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "POST-BEARER", nonVerbose);
    }

    public async postJsonWithApiKey(method: string, body: Record<string, unknown>, apiKey: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "post",
            url: this.baseURL.toString() + method,
            data: body,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                "X-API-KEY": apiKey,
                "Content-Type": "application/json; charset=UTF-8",
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "POST-APIKEY", nonVerbose);
    }

    public async getWithBearerToken(method: string, queryParams: Record<string, string>, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const endpoint = `${this.baseURL.toString()}${method}?${new URLSearchParams(queryParams).toString()}`;
        const config: AxiosRequestConfig = {
            method: "get",
            url: endpoint,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Authorization: `Bearer ${token}`,
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "GET-BEARER", nonVerbose);
    }

    public async putJsonWithBearerToken(method: string, body: JSON, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "put",
            url: this.baseURL.toString() + method,
            data: body,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json; charset=UTF-8",
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "PUT-BEARER", nonVerbose);
    }

    public async deleteJsonWithBearerToken(method: string, body: JSON, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const config: AxiosRequestConfig = {
            method: "delete",
            url: this.baseURL.toString() + method,
            data: body,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json; charset=UTF-8",
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "DELETE-BEARER", nonVerbose);
    }

    public async putWithBearerToken(method: string, queryParams: Record<string, string>, token: string, nonVerbose?: boolean): Promise<AxiosResponse> {
        const endpoint = `${this.baseURL.toString()}${method}?${new URLSearchParams(queryParams).toString()}`;
        const config: AxiosRequestConfig = {
            method: "put",
            url: endpoint,
            headers: {
                "User-Agent": RestAPI.USER_AGENT,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json; charset=UTF-8",
            },
            validateStatus: () => true,
        };
        return this.requestWithLog(config, "PUT-WITH-BEARER", nonVerbose);
    }
}
