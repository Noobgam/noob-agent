import {ReviewedCard} from "../anki/model";
import {withTransaction} from "./client";
import {NoteInfo} from "../anki/client";

export async function insertReviewedCards(values: (ReviewedCard & { deckName: string }) []) {
    await withTransaction(async conn => {
        {
            await conn.query("DELETE FROM anki_reviews");
            const vals = values.map(review => [
                review.reviewId,
                review.cardId,
                review.usn,
                review.buttonPressed,
                review.previousInterval,
                review.newInterval,
                review.newFactor,
                review.reviewDurationMs,
                review.reviewType,
                review.deckName
            ])
            await conn.query(
                "INSERT INTO anki_reviews (reviewId, cardId, usn, buttonPressed, previousInterval, newInterval, newFactor, reviewDurationMs, reviewType, deckName) VALUES ?",
                [vals]
            )
        }
    })
}

export async function insertNoteInfo(values: NoteInfo[]) {
    await withTransaction(async conn => {
        {
            await conn.query("DELETE FROM note_tags");
            const vals = values.flatMap(note => note.tags.map(tag => [note.noteId, tag]))
            await conn.query(
                "INSERT INTO note_tags (noteId, tag) VALUES ?",
                [vals]
            )
        }
        {
            await conn.query("DELETE FROM note_cards");
            const vals = values.flatMap(note => note.cards.map(card => [note.noteId, card]))
            await conn.query(
                "INSERT INTO note_cards (noteId, cardId) VALUES ?",
                [vals]
            )
        }
    })
}
