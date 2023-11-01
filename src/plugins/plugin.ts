import {Registry} from "prom-client";
import {AllPluginNames} from "./registry";

export type PluginConfig = {
    disabled: boolean;
}

const defaultConfig: PluginConfig = {
    disabled: false,
}

export abstract class Plugin {

    config: PluginConfig;

    constructor(config: PluginConfig = defaultConfig) {
        this.config = config;
    }

    abstract getName(): AllPluginNames;
    /**
     * Is executed by the orchestrator
     */
    abstract executePluginCron(): Promise<void>;

    abstract getExecutionDelayMs(): number;

    async readyCheck(): Promise<boolean> {
        return true;
    }
}

export abstract class PrometheusPlugin extends Plugin {
    /**
     * Must return whether the metrics were collected by the plugin at least once.
     */
    abstract metricsCollectedAtLeastOnce(): boolean;

    /**
     * Gets the registry to push metrics from
     */
    abstract getRegistry(): Registry;

    /**
     * Gets job name to mark in prometheus when pushing
     */
    abstract getJobName(): string;
}
