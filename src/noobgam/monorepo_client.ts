import {RawAnkiCardType} from "../models/anki";
import fetch from "node-fetch";
import {throwException} from "../utils/functional";
import {getLog} from "../config";

const log = getLog({
    name: "MonorepoClient",
})

export class MonorepoClient {
    endpoint: string;
    token: string;

    constructor(endpoint: string, token: string) {
        this.endpoint = endpoint;
        this.token = token;
    }

    async convertDiaryToCards(diary: string, language: string): Promise<RawAnkiCardType[]> {
        const res = await fetch(this.endpoint + "/anki/generateCardsFromDiary", {
            method: 'POST',
            body: JSON.stringify({
                diary: diary,
                language: language,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        });
        const jsonRes = await res.json();
        log.info(`Received response ${JSON.stringify(jsonRes)}`);
        return (jsonRes as { cards: RawAnkiCardType[]}).cards;
    }
}

export const monorepoClient = new MonorepoClient(
    "https://monorepo.noobgam.com",
    process.env['NOOBGAM_PERSONAL_PASSWORD'] ?? throwException('personal password must be defined to use monorepo')
)
