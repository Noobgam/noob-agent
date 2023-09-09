import {AnkiConfig} from "../plugins/anki/anki_config";
import fetch from "node-fetch";

interface AnkiConnectRequest {
    action: string;
    params?: object;
}

interface NoteInfo {
    cards: number[],
    fields: {
        noteId: number;
    },
    tags: string[];
}

export class AnkiClient {
    config: AnkiConfig;

    constructor(config: AnkiConfig) {
        this.config = config;
    }

    async ankiRequest(config: AnkiConfig, request: AnkiConnectRequest) {
        console.log(`Doing request ${JSON.stringify({
            ...request,
            version: 6,
        })}`)
        const res = await fetch(config.url, {
            method: 'POST',
            body: JSON.stringify({
                ...request,
                version: 6,
            }),
        });
        return await res.json();
    }

    async findNotes(deckName: string): Promise<{ result: number[] }> {
        return this.ankiRequest(this.config, {
            action: 'findNotes',
            params: {
                query: `"deck:${deckName}"`,
            }
        }).then(data => data as ({ result : number[] }))
    }

    async getNotesInfo(noteIds: number[]): Promise<any>{
        return this.ankiRequest(this.config, {
            action: 'notesInfo',
            params: {
                notes: noteIds
            }
        })
    }

    async updateNoteFields(note: {
        id: number;
        fields: Record<string, string>
    }): Promise<any>{
        return this.ankiRequest(this.config, {
            action: 'updateNoteFields',
            params: {
                note: note
            }
        })
    }

    async getDeckNames(): Promise<{ result: string[] }> {
        return this.ankiRequest(this.config, {
            action: 'deckNames',
        }).then(data => data as ({ result : string[] }))
    }

    // (reviewTime, cardID, usn, buttonPressed, newInterval, previousInterval, newFactor, reviewDuration, reviewType)
    async getDeckReviews(deckName: string, startId?: number): Promise<{ result: number[][] }> {
        return this.ankiRequest(this.config, {
            action: 'cardReviews',
            params: {
                deck: deckName,
                startID: startId ?? 0,
            }
        }).then(data => data as ({ result : number[][] }))
    }

    async cardsToNotes(cards: number[]): Promise<{ result: number[]}> {
        return this.ankiRequest(this.config, {
            action: 'cardsToNotes',
            params: {
                cards: cards,
            }
        }).then(data => data as ({ result : number[] }))
    }

    async notesInfo(notes: number[]): Promise<{ result: NoteInfo[] }> {
        return this.ankiRequest(this.config, {
            action: 'notesInfo',
            params: {
                notes: notes,
            }
        }).then(data => data as ({ result : NoteInfo[] }))
    }
}
