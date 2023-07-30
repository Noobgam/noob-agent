import {globalConfig} from './config'
import express from 'express'
import {AnkiClient} from "./anki/client";
import {pushMetrics} from "./prometheus/client";
import {collectSnapshot} from "./anki/collect_snapshot";
import {noopConcurrentInterval} from "./utils/functional";

const app = express()
const port = 3000

app.listen(port, () => {
    const anki = new AnkiClient(globalConfig.anki);

    noopConcurrentInterval(
        'refreshAnkiMetrics',
        async () => {
            try {
                await collectSnapshot(anki);
            } catch (e) {
                console.log(e);
            }
        }, 30000
    )

    noopConcurrentInterval(
        'prometheusPush',
        async () => {
            try {
                await pushMetrics(globalConfig.prometheus);
            } catch (e) {
                console.log(e);
            }
        }, 5000
    )
})
