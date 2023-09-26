import {RawAnkiCardType} from "../models/anki";
import fetch from "node-fetch";

export class MonorepoClient {
    endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async convertDiaryToCards(diary: string): Promise<RawAnkiCardType[]> {
        const res = await fetch(this.endpoint + "/anki/generateCardsFromDiary", {
            method: 'POST',
            body: JSON.stringify({
                diary: diary
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const jsonRes = await res.json();
        return (jsonRes as { cards: RawAnkiCardType[]}).cards;
    }
}

export const monorepoClient = new MonorepoClient("http://127.0.0.1:5000")
