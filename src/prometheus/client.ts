import {Pushgateway} from 'prom-client';
import {PrometheusConfig} from "./config";
import {metrics} from "./metrics";
import {log} from "../config";

export async function pushMetrics(config: PrometheusConfig) {
    const client = new Pushgateway(
        config.url,
        {
            headers: {
                Authorization: `Basic ${btoa(config.username + ':' + config.password)})`
            }
        }
    )
    if (metrics.locked) {
        // TODO: this is definitely yikes.
        log.warn("Cannot publish metrics when locked. Discarding result.");
        return;
    }
    metrics.locked = true;
    try {
        log.info(`Pushing metrics`);
        if (process.env['LOCAL_START'] === "true") {
            return console.log(metrics.ankiReviewGauge)
        }
        return await client.push({jobName: 'anki_personal_monitoring'});
    } finally {
        metrics.locked = false
    }
}
