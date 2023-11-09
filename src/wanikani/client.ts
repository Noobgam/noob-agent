import fetch from "node-fetch";
import {Assignment} from "./models";
import {GetAssignmentOutput, GetAssignmentsSchema} from "./operations";

export class WaniKaniClient {
    token: string;
    endpoint: string;

    constructor(token: string, endpoint: string = 'https://api.wanikani.com') {
        this.token = token;
        this.endpoint = endpoint;
    }

    private async executeRaw<T>(fullUrl: string, method: 'GET' = 'GET') {
        const res = await fetch(fullUrl, {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return res.json().then(r => r as T);
    }

    private async executeRequest<T>(endpoint: string, method: 'GET' = 'GET'): Promise<T> {
        return this.executeRaw(this.endpoint + '/v2/' + endpoint, method)
    }

    private async getAssignments(directUrl?: string): Promise<GetAssignmentOutput> {
        if (directUrl) {
            return await this.executeRaw<any>(directUrl).then(
                GetAssignmentsSchema.parse
            )
        } else {
            return await this.executeRequest<any>('assignments').then(
                GetAssignmentsSchema.parse
            )
        }
    }

    /**
     * https://knowledge.wanikani.com/wanikani/srs-stages/ will give a good overview of that stuff.
     * Anything with srs_stage above 6 I think can be considered shown externally
     */
    async fetchAllAssignments(): Promise<Assignment[]> {
        let iter;
        const collected: Assignment[] = [];
        // don't while true here.
        let res = await this.getAssignments();

        collected.push(
            ...res.data.map(d => d.data as Assignment)
        )
        for (iter = 0; res.pages.next_url && iter < 100; ++iter) {
            res = await this.getAssignments(res.pages.next_url);

            collected.push(
                ...res.data.map(d => d.data as Assignment)
            )
        }
        if (iter == 100) {
            console.error("Could not fetch all the pages.")
        }
        return collected;
    }
}
