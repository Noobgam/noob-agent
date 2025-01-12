import {throwException} from "../utils/functional";
import {fetch, Agent, Response} from "undici";
import {getGlobalLog} from "../config";
import * as net from "net"; // Import the net module

const getLog = () => getGlobalLog({
    name: "obsidian-client"
})

export class ObsidianClient {
    port: number;
    token: string;


    constructor(port: number, token: string) {
        this.port = port;
        this.token = token;
    }

    private async fetch(suffix: string, init?: RequestInit): Promise<Response> {
        getLog().info(`Executing: https://127.0.0.1:${this.port}${suffix}`);
        return fetch(`https://127.0.0.1:${this.port}${suffix}`, {
            ...init,
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            dispatcher: new Agent({
                connect: {
                    rejectUnauthorized: false,
                }
            })
        });
    }

    async isUp(): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();

            socket.once('connect', () => {
                socket.destroy();
                resolve(true);
            });

            socket.once('error', () => {
                socket.destroy();
                resolve(false);
            });

            socket.connect({ port: this.port, host: '127.0.0.1' });
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
    parseInt(process.env["NOOBGAM_OBSIDIAN_PORT"] ?? throwException("token not defined")),
    process.env["NOOBGAM_OBSIDIAN_TOKEN"] ?? throwException("token not defined")
)
