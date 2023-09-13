import {AnkiClient} from "../anki/client";
import {globalConfig, log} from "../config";
import fetch from "node-fetch";
import {ReviewedCard} from "../anki/model";
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const ankiClient = new AnkiClient(globalConfig.anki);

const deckName = "Playground";

const res = await ankiClient.findNotes(deckName);
const notes = await ankiClient.getNotesInfo(res.result).then(r => r.result);
const decks = (await ankiClient.getDeckNames()).result;
const results: ReviewedCard[] = []
log.info(`Fetching deck cards`);
for (const deck of decks) {
    const deckResult = (await ankiClient.getDeckReviews(deck)).result;
    results.push(...deckResult)
}
const client = createClient({
    username: process.env['CLICKHOUSE_USERNAME'],
    password: process.env['CLICKHOUSE_PASSWORD'],
    host: process.env['CLICKHOUSE_HOST'],
    /* configuration */
});
await client.insert({
    table: 'raw_anki_reviews',
    values: results,
    format: "JSONEachRow",
});

const extractJson = (s: string) => {
    const codeMarkup = '```';
    const l = s.indexOf(codeMarkup);
    if (l === -1) {
        throw new Error("Failed to extract code");
    }
    const r = s.indexOf(codeMarkup, l + 1);
    if (r === -1) {
        throw new Error("Failed to extract code")
    }
    return s.substring(l + codeMarkup.length, r);
}

const remapCardFields = async (fields: any) => {
    const response = await fetch("http://127.0.0.1:5000/generateAnkiCard", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            card_fields: fields,
            target_language: "Japanese",
            theme: "General theme",
        })
    }).then(r => r.text());
    return JSON.parse(extractJson(response));
}

notes.forEach(async (note: any) => {
    const noteFields = Object.fromEntries(Object.entries(note.fields).map(([key, value]) => {
        return [key, (value as any).value as string]
    }))
    const newFields = await remapCardFields(noteFields);
    console.log(await ankiClient.updateNoteFields({
        id: note.noteId,
        fields: {...noteFields, ...(newFields as Record<string, string>)},
    }))
})


