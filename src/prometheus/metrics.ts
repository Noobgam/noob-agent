import {Gauge} from "prom-client";

export const metrics = {
    ankiReviewGauge: new Gauge({
        name: 'anki_review',
        help: 'Individual anki card review',
        labelNames: ['deck_name', 'language']
    }),
    locked: false,
}
