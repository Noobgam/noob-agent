import {AnkiConfig} from "../plugins/anki/anki_config";
import fetch from "node-fetch";
import {ReviewedCard} from "./model";
import {log} from "../config";

interface AnkiConnectRequest {
    action: string;
    params?: object;
}

export interface NoteInfo {
    noteId: number;
    cards: number[],
    fields: {
        noteId: number;
    },
    tags: string[];
}

const ANKI_CONNECT_VERSION = 6;

export class AnkiClient {
    config: AnkiConfig;

    constructor(config: AnkiConfig) {
        this.config = config;
    }

    private async ankiRequest(config: AnkiConfig, request: AnkiConnectRequest, silent: boolean = false) {
        const stringifiedBody = JSON.stringify({
            ...request,
            version: ANKI_CONNECT_VERSION,
        });
        if (!silent) {
            log.info(`Doing request ${stringifiedBody}`)
        }
        const res = await fetch(config.url, {
            method: 'POST',
            body: stringifiedBody,
        });
        return await res.json();
    }

    async ankiIsUp() : Promise<boolean>{
        try {
            const res = await this.ankiRequest(this.config, {
                action: 'version',
            }, true).then(data => data as ({ result: number }))
            return res.result == 6;
        } catch (e) {
            return false;
        }
    }

    async findNotes(deckName: string): Promise<{ result: number[] }> {
        return this.ankiRequest(this.config, {
            action: 'findNotes',
            params: {
                query: `"deck:${deckName}"`,
            }
        }).then(data => data as ({ result: number[] }))
    }

    async getNotesInfo(noteIds: number[]): Promise<any> {
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
    }): Promise<any> {
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
        }).then(data => data as ({ result: string[] }))
    }

    async createDeck(deckName: string): Promise<void> {
        await this.ankiRequest(this.config, {
            action: 'createDeck',
            params: {
                deck: deckName
            }
        })
    }

    async addNotes(notes: {
        deckName: string,
        modelName: string;
        fields: Record<string, string>,
        tags: string[]
    }[]): Promise<void> {
        await this.ankiRequest(this.config, {
            action: 'addNotes',
            params: {
                notes: notes
            }
        })
    }

    // (reviewTime, cardID, usn, buttonPressed, newInterval, previousInterval, newFactor, reviewDuration, reviewType)
    async getDeckReviews(deckName: string, startId?: number): Promise<{ result: ReviewedCard[] }> {
        return this.ankiRequest(this.config, {
            action: 'cardReviews',
            params: {
                deck: deckName,
                startID: startId ?? 0,
            }
        }).then(data => data as ({ result: number[][] }))
            .then(res => {
                return {
                    result: res.result.map(tuple => {
                        return {
                            reviewId: tuple[0],
                            cardId: tuple[1],
                            usn: tuple[2],
                            buttonPressed: tuple[3],
                            previousInterval: tuple[4],
                            newInterval: tuple[5],
                            newFactor: tuple[6],
                            reviewDurationMs: tuple[7],
                            reviewType: tuple[8],
                        } as ReviewedCard
                    })
                }
            })
    }

    async cardsToNotes(cards: number[]): Promise<{ result: number[] }> {
        return this.ankiRequest(this.config, {
            action: 'cardsToNotes',
            params: {
                cards: cards,
            }
        }).then(data => data as ({ result: number[] }))
    }

    async notesInfo(notes: number[]): Promise<{ result: NoteInfo[] }> {
        return this.ankiRequest(this.config, {
            action: 'notesInfo',
            params: {
                notes: notes,
            }
        }).then(data => data as ({ result: NoteInfo[] }))
    }
}
