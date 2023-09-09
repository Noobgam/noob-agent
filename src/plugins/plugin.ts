import {Registry} from "prom-client";

export abstract class Plugin {

    abstract getName(): string;
    /**
     * Is executed by the orchestrator
     */
    abstract executePluginCron(): Promise<void>;

    abstract getExecutionDelayMs(): number;
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