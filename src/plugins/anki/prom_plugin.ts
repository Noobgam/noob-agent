import {PluginConfig, PrometheusPlugin} from "../plugin";
import {Registry} from "prom-client";
import {AnkiClient} from "../../anki/client";
import {collectSnapshot} from "./collect_snapshot";
import {ankiRegistry} from "../../prometheus/metrics";
import {AllPluginNames, PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME} from "../registry";

export class AnkiPromPlugin extends PrometheusPlugin {
    metricsCollected: boolean;
    ankiClient: AnkiClient;

    constructor(config: PluginConfig, ankiClient: AnkiClient) {
        super(config);
        this.metricsCollected = false;
        this.ankiClient = ankiClient;
    }

    getName(): AllPluginNames {
        return PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME;
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
