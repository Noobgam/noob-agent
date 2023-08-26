import {globalConfig} from './config'
import {AnkiClient} from "./plugins/anki/client";
import {pushMetrics} from "./prometheus/client";
import {collectSnapshot} from "./plugins/anki/collect_snapshot";
import {noopConcurrentInterval} from "./utils/functional";

const anki = new AnkiClient(globalConfig.anki);
let loopId = 0;

noopConcurrentInterval(
    'refreshAnkiMetrics',
    async () => {
        try {
            await collectSnapshot(anki);
            loopId = 1;
        } catch (e) {
            console.log(e);
        }
    }, 30000
)
noopConcurrentInterval(
    'prometheusPush',
    async () => {
        if (!loopId) {
            // do not push if no metrics were pushed. Pushgateway overrides ALL metrics per job.
            return;
        }
        try {
            await pushMetrics(globalConfig.prometheus);
        } catch (e) {
            console.log(e);
        }
    }, 5000
)
