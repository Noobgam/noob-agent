import {Plugin, PluginConfig} from "../plugin";
import {AnkiClient} from "../../anki/client";
import {insertNoteInfo, insertReviewedCards} from "../../mysql/anki_client";
import {getGlobalLog} from "../../config";
import {ReviewedCard} from "../../anki/model";
import {AllPluginNames, MYSQL_ANKI_COLLECTOR_PLUGIN_NAME} from "../registry";
import {ping} from "../../mysql/client";
import objectHash from "object-hash";

const getLog = () => getGlobalLog({
    name: "mysql-anki-plugin"
})

export class AnkiMysqlPlugin extends Plugin {

    ankiClient: AnkiClient;
    lastReviewsHash: string;
    lastNotesHash: string;

    constructor(config: PluginConfig, ankiClient: AnkiClient) {
        super(config);
        this.ankiClient = ankiClient;
        this.lastNotesHash = "";
        this.lastReviewsHash = "";
    }

    getName(): AllPluginNames {
        return MYSQL_ANKI_COLLECTOR_PLUGIN_NAME;
    }

    async readyCheck(): Promise<boolean> {
        const ankiUp = await this.ankiClient.ankiIsUp();
        const mysqlUp = await ping()
        return ankiUp && mysqlUp;
    }

    async executePluginCron(): Promise<void> {
        const decks = (await this.ankiClient.getDeckNames()).result;
        const cardsToFetch: number[] = [];
        const reviews: (ReviewedCard & { deckName: string }) [] = []
        for (const deck of decks) {
            const deckResult = (await this.ankiClient.getDeckReviews(deck)).result;
            reviews.push(...deckResult.map(card => {
                return {
                    ...card,
                    deckName: deck
                }
            }))
            cardsToFetch.push(...deckResult.flatMap(d => d.cardId))
        }

        const reviewsHash = objectHash(reviews);
        if (reviewsHash !== this.lastReviewsHash) {
            await insertReviewedCards(reviews);
            this.lastReviewsHash = reviewsHash;
        } else {
            getLog().info(`Will not update reviews, nothing has changed`);
        }
        const noteIds = (await this.ankiClient.cardsToNotes(cardsToFetch)).result;

        getLog().info(`Fetching ${noteIds.length} notes`);
        const allNotes = (await this.ankiClient.notesInfo(noteIds)).result;
        const notesHash = objectHash(allNotes);
        if (notesHash !== this.lastNotesHash) {
            await insertNoteInfo(allNotes)
            this.lastNotesHash = notesHash;
        } else {
            getLog().info(`Will not update notes, nothing has changed`);
        }
    }

    getExecutionDelayMs(): number {
        return 30000;
    }
}
