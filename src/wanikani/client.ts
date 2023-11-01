import fetch from "node-fetch";

export class WaniKaniClient {
    token: string;
    endpoint: string;

    constructor(token: string, endpoint: string) {
        this.token = token;
        this.endpoint = endpoint;
    }

    private async executeRequest<T>(endpoint: string, method: 'GET' = 'GET'): Promise<T> {
        const res = await fetch(this.endpoint + '/v2/' + endpoint, {
            method: method,
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });
        return res.json().then(r => r as T);

    }

    async getReviewStatistics() {
        const res = await this.executeRequest<any>('review_statistics');
        console.log(res);
    }
}
