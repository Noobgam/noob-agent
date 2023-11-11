import {withTransaction} from "./client";

export type LanguageLearningSnapshot = {
    date: Date,
    language: string,
    origin: string,
    srs_level: number,
    count: number,
};

export async function publishSnapshots(snapshots: LanguageLearningSnapshot[]) {
    await withTransaction(async conn => {
        for (let snapshot of snapshots) {
            const vals = [
                snapshot.date.getTime(),
                snapshot.language,
                snapshot.origin,
                snapshot.srs_level,
                snapshot.count,
            ]
            await conn.query(
                "INSERT INTO language_learning (date, language, origin, srs_level, count) VALUES (?)",
                [vals]
            );
        }
    })
}
