import {RawAnkiCardType} from "../models/anki";
import {throwException} from "../utils/functional";
import {getGlobalLog} from "../config";

const getLog = () => getGlobalLog({
    name: "monorepo-client"
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
        getLog().info(`Received response ${JSON.stringify(jsonRes)}`);
        return (jsonRes as { cards: RawAnkiCardType[]}).cards;
    }
}

export const monorepoClient = new MonorepoClient(
    "https://monorepo.noobgam.com",
    process.env['NOOBGAM_PERSONAL_PASSWORD'] ?? throwException('personal password must be defined to use monorepo')
)
