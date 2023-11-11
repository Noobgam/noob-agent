import {Plugin, PluginConfig} from "../plugin";
import {AnkiClient} from "../../anki/client";
import {insertNoteInfo, insertReviewedCards} from "../../mysql/anki_client";
import {getLog} from "../../config";
import {ReviewedCard} from "../../anki/model";
import {AllPluginNames, MYSQL_ANKI_COLLECTOR_PLUGIN_NAME} from "../registry";
import {ping} from "../../mysql/client";

const log = getLog({
    name: "mysql-anki-plugin"
})

export class AnkiMysqlPlugin extends Plugin {

    ankiClient: AnkiClient;

    constructor(config: PluginConfig, ankiClient: AnkiClient) {
        super(config);
        this.ankiClient = ankiClient;
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
        await insertReviewedCards(reviews);
        const noteIds = (await this.ankiClient.cardsToNotes(cardsToFetch)).result;
        log.info(`Fetching ${noteIds.length} notes`);
        const allNotes = (await this.ankiClient.notesInfo(noteIds)).result;
        await insertNoteInfo(allNotes)
    }

    getExecutionDelayMs(): number {
        return 30000;
    }
}
