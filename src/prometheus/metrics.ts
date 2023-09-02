import {Gauge, Registry} from "prom-client";

export const ankiRegistry = new Registry();

export const metrics = {
    ankiReviewGauge: new Gauge({
        name: 'anki_review',
        help: 'Individual anki card review',
        labelNames: ['deck_name', 'language'],
        registers: [ankiRegistry],
    }),
    locked: false,
}
