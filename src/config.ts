import {AnkiConfig} from "./plugins/anki/anki_config";
import {PrometheusConfig} from "./prometheus/config";

import pino, {Logger} from "pino";
import {AsyncLocalStorage} from "async_hooks";

export interface Config {
    prometheus: PrometheusConfig;
    anki: AnkiConfig;
}

export function requiredEnv(name: string): string {
    const res = process.env[name];
    if (!res) {
        throw Error(`Environment variable ${name} is not defined`);
    }
    return res;
}

export const configureFromEnvironment: () => Config = () => {
    return {
        prometheus: {
            url: requiredEnv("NOOBGAM_PROMETHEUS_PUSH_URL"),
            username: requiredEnv("NOOBGAM_PROMETHEUS_USERNAME"),
            password: requiredEnv("NOOBGAM_PROMETHEUS_PASSWORD"),
        },
        anki: {
            url: 'http://127.0.0.1:8765',
        }
    }
}

const defaultLog = pino()

const asyncLocalStorage = new AsyncLocalStorage<Logger>();

export async function doWithLogger<T>(bindings: pino.Bindings, callable: () => T | Promise<T>): Promise<T> {
    const logger = defaultLog.child(bindings);
    return asyncLocalStorage.run(logger, async () => {
        return callable();
    });
}

export const getGlobalLog = (bindings?: pino.Bindings) => {
    const logger = asyncLocalStorage.getStore() || defaultLog;
    return bindings ? logger.child(bindings) : logger;
}
export const globalConfig: Config = configureFromEnvironment();
