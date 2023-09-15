import {clickHouseClient} from "./client";
import {ReviewedCard} from "../anki/model";

export interface ClickhouseNodeInfo {
    noteId: number;
    cards: number[];
    tags: string[];
}

export async function cleanTables() {
    await clickHouseClient.query({
        query: `DELETE FROM anki_reviews_tmp`
    });
    await clickHouseClient.query({
        query: `DELETE FROM cards_to_notes_tmp`
    });
}

export async function swapTables() {
    //await clickHouseClient.query(`EXCHANGE`)
}

export async function insertReviewedCards(cards: (ReviewedCard & { deckName: string }) []) {
    await clickHouseClient.insert({
        table: "anki_reviews",
        values: cards,
        format: "JSONEachRow"
    })
}

export async function insertNoteInfo(values: ClickhouseNodeInfo[]) {
    await clickHouseClient.insert({
        table: "note_info",
        values: values,
        format: "JSONEachRow"
    })
}
