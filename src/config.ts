import {AnkiConfig} from "./plugins/anki/anki_config";
import {PrometheusConfig} from "./prometheus/config";
import {ILogObj, Logger} from "tslog";

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

export const log: Logger<ILogObj> = new Logger({
    type: "pretty",
    stylePrettyLogs: !!process.env["LOCAL_START"],
});

export const getLog = ({ name } : { name: string }) => {
    return new Logger({
        name,
        type: "pretty",
        stylePrettyLogs: !!process.env["LOCAL_START"],
    })
}
export const globalConfig: Config = configureFromEnvironment();
