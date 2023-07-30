import {metrics} from "../prometheus/metrics";
import {AnkiClient} from "./client";
import {log} from "../config";

export async function collectSnapshot(anki: AnkiClient) {
    const decks = (await anki.getDeckNames()).result;
    const cardsToFetch: number[] = [];
    log.info(`Fetching deck cards`);
    for (const deck of decks) {
        const deckResult = (await anki.getDeckReviews(deck)).result;
        cardsToFetch.push(...deckResult.flatMap(d => d[1]))
    }
    const noteIds = (await anki.cardsToNotes(cardsToFetch)).result;
    log.info(`Fetching ${noteIds.length} notes`);
    // @ts-ignore
    const allNotes = (await anki.notesInfo(noteIds)).result;
    log.info(`Done fetching notes`);
    if (metrics.locked) {
        log.error("Cannot update metrics when locked. Discarding result.");
        return;
    }
    metrics.locked = true;
    try {
        metrics.ankiReviewGauge.reset()
        for (const deck of decks) {
            const rawResult = await anki.getDeckReviews(deck);
            for (let tuple of rawResult.result) {
                const cardId = tuple[1];
                const note = allNotes.find(note => note.cards.indexOf(cardId) !== -1);
                if (!note) {
                    log.error(`Could not match card ${cardId}`);
                    continue;
                }
                const languages =
                    note.tags.filter(t => t.startsWith('language_'))
                        .map(t => t.substring('language_'.length));
                if (languages.length != 1) {
                    // untracked, this is something odd
                    continue;
                }
                metrics.ankiReviewGauge.inc({deck_name: deck, language: languages[0]}, 1);
            }
        }
    } finally {
        metrics.locked = false;
    }
}
