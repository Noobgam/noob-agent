import {PrometheusPlugin} from "../plugin";
import {Registry} from "prom-client";
import {AnkiClient} from "./client";
import {collectSnapshot} from "./collect_snapshot";
import {ankiRegistry} from "../../prometheus/metrics";

export class AnkiPlugin extends PrometheusPlugin {
    metricsCollected: boolean;
    ankiClient: AnkiClient;

    constructor(ankiClient: AnkiClient) {
        super();
        this.metricsCollected = false;
        this.ankiClient = ankiClient;
    }

    getName(): string {
        return "ankiCardCollector";
    }

    async executePluginCron(): Promise<void> {
        await collectSnapshot(this.ankiClient);
        this.metricsCollected = true;
    }

    getExecutionDelayMs(): number {
        return 30000;
    }

    getJobName(): string {
        return "anki_personal_monitoring";
    }

    getRegistry(): Registry {
        return ankiRegistry;
    }

    metricsCollectedAtLeastOnce(): boolean {
        return this.metricsCollected;
    }
}
