import {metrics} from "../../prometheus/metrics";
import {AnkiClient} from "../../anki/client";
import {getGlobalLog} from "../../config";

const getLog = () => getGlobalLog({
    name: "anki-snapshot"
})

export async function collectSnapshot(anki: AnkiClient) {
    const decks = (await anki.getDeckNames()).result;
    const cardsToFetch: number[] = [];
    getLog().info(`Fetching deck cards`);
    for (const deck of decks) {
        const deckResult = (await anki.getDeckReviews(deck)).result;
        cardsToFetch.push(...deckResult.flatMap(d => d.cardId))
    }
    const noteIds = (await anki.cardsToNotes(cardsToFetch)).result;
    getLog().info(`Fetching ${noteIds.length} notes`);
    const allNotes = (await anki.notesInfo(noteIds)).result;
    getLog().info(`Done fetching notes`);
    const tmpMetrics = new Map<string, Map<string, number>>();
    for (const deck of decks) {
        const rawResult = await anki.getDeckReviews(deck);
        for (const reviewedCard of rawResult.result) {
            const cardId = reviewedCard.cardId;
            const note = allNotes.find(note => note.cards.indexOf(cardId) !== -1);
            if (!note) {
                getLog().error(`Could not match card ${cardId}`);
                continue;
            }
            const languages =
                note.tags.filter(t => t.startsWith('language_'))
                    .map(t => t.substring('language_'.length));
            if (languages.length != 1) {
                // untracked, this is something odd
                continue;
            }
            if (!tmpMetrics.has(deck)) {
                tmpMetrics.set(deck, new Map<string, number>());
            }
            const deckMap = tmpMetrics.get(deck)!;
            deckMap.set(languages[0], (deckMap.get(languages[0]) ?? 0) + 1)
        }
    }

    tmpMetrics.forEach((tmpMap, deckName) => {
        tmpMap.forEach((value, language) => {
            metrics.ankiReviewGauge.set({deck_name: deckName, language: language}, value);
        })
    })
}
