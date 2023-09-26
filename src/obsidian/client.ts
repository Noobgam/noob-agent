import fetch, {RequestInit, Response} from "node-fetch";
import {throwException} from "../utils/functional";
import * as https from "https";
import {log} from "../config";

export class ObsidianClient {
    port: number;
    token: string;


    constructor(port: number, token: string) {
        this.port = port;
        this.token = token;
    }

    private async fetch(suffix: string, init?: RequestInit): Promise<Response> {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });
        log.info(`Executing: https://127.0.0.1:${this.port}${suffix}`);
        return fetch(`https://127.0.0.1:${this.port}${suffix}`, {
            ...init,
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            agent: httpsAgent
        });
    }

    async listFiles(prefix: string): Promise<string[]> {
        const resp = await this.fetch(`/vault/${prefix}`).then(r => r.json());
        return (resp as {
            "files": string[]
        }).files
    }

    async getFile(filePath: string): Promise<string> {
        return await this.fetch(`/vault/${filePath}`).then(r => r.text());
    }

    async putFile(filePath: string, fileContent: string): Promise<void> {
        await this.fetch(`/vault/${filePath}`, {
            method: 'PUT',
            body: fileContent
        })
    }

    async searchFilesByText(query: string): Promise<string[]> {
        const res = await this.fetch(`/search/simple?query=${encodeURIComponent(query)}`, {
            method: 'POST',
        })
            .then(r => r.json());
        return (res as { filename: string }[]).map(x => x.filename)
    }
}

export const getObsidianClient = () => new ObsidianClient(
    parseInt(process.env["NOOBGAM_OBSIDIAN_PORT"] ?? throwException("token not defined")) ,
    process.env["NOOBGAM_OBSIDIAN_TOKEN"] ?? throwException("token not defined")
)
