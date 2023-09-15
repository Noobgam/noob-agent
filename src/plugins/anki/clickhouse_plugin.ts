import {Plugin} from "../plugin";
import {AnkiClient} from "../../anki/client";
import {ClickHouseClient} from "@clickhouse/client";
import {insertNoteInfo, insertReviewedCards} from "../../clickhouse/anki_client";
import {log} from "../../config";

export class AnkiClickhousePlugin extends Plugin {

    ankiClient: AnkiClient;
    clickHouseClient: ClickHouseClient;

    constructor(ankiClient: AnkiClient, clickHouseClient: ClickHouseClient) {
        super();
        this.ankiClient = ankiClient;
        this.clickHouseClient = clickHouseClient;
    }

    getName(): string {
        return "clickhouseAnkiCollector";
    }

    async executePluginCron(): Promise<void> {
        const decks = (await this.ankiClient.getDeckNames()).result;
        const cardsToFetch: number[] = [];
        for (const deck of decks) {
            const deckResult = (await this.ankiClient.getDeckReviews(deck)).result;
            await insertReviewedCards(deckResult.map(card => {
                return {
                    ...card,
                    deckName: deck
                }
            }));
            cardsToFetch.push(...deckResult.flatMap(d => d.cardId))
        }
        const noteIds = (await this.ankiClient.cardsToNotes(cardsToFetch)).result;
        log.info(`Fetching ${noteIds.length} notes`);
        const allNotes = (await this.ankiClient.notesInfo(noteIds)).result;
        await insertNoteInfo(allNotes.map(note => {
            // explicit unpack to remove extra fields
            return {
                noteId: note.noteId,
                cards: note.cards,
                tags: note.tags,
            }
        }))
    }

    getExecutionDelayMs(): number {
        return 30000;
    }
}
