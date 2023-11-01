import {Plugin, PrometheusPlugin} from "../plugin";
import {noopConcurrentInterval} from "../../utils/functional";
import {Pushgateway} from "prom-client";
import {PrometheusConfig} from "../../prometheus/config";
import {log} from "../../config";
import {GlobalPluginConfiguration} from "../registry";

export class Executor {
    pluginConfig: GlobalPluginConfiguration;
    registeredPlugins: Plugin[];
    prometheusConfig: PrometheusConfig;

    constructor(pluginConfig: GlobalPluginConfiguration, plugins: Plugin[], prometheusConfig: PrometheusConfig) {
        this.pluginConfig = pluginConfig;
        this.registeredPlugins = [];
        this.prometheusConfig = prometheusConfig;
        plugins.forEach(plugin => this.registerPlugin(plugin))
    }

    registerPlugin(plugin: Plugin) {
        const globalConf = this.pluginConfig[plugin.getName()];
        if (globalConf && !globalConf.enabled) {
            log.info(`Ignoring plugin ${plugin.getName()}, disabled in global config`);
            return;
        }
        if (plugin.config.disabled) {
            log.info(`Ignoring plugin ${plugin.getName()}, disabled in code`);
            return;
        }
        log.info(`Registering plugin ${plugin.getName()}`);
        // we don't want to actually wait for the first interval, right
        noopConcurrentInterval(
            plugin.getName(),
            async () => {
                const ready = await plugin.readyCheck();
                if (ready) {
                    await plugin.executePluginCron();
                }
            }, plugin.getExecutionDelayMs()
        )
        if (plugin instanceof PrometheusPlugin) {
            log.info(`Registering prometheus plugin`);
            noopConcurrentInterval(
                plugin.getName() + 'metricsPush',
                async () => {
                    if (!plugin.metricsCollectedAtLeastOnce()) {
                        // do not push if no metrics were pushed. Pushgateway overrides ALL metrics per job.
                        return;
                    }
                    const client = new Pushgateway(
                        this.prometheusConfig.url,
                        {
                            headers: {
                                Authorization: `Basic ${btoa(this.prometheusConfig.username + ':' + this.prometheusConfig.password)})`
                            }
                        },
                        plugin.getRegistry()
                    )
                    if (process.env['LOCAL_START'] === "true") {
                        log.info(await plugin.getRegistry().metrics())
                    } else {
                        await client.pushAdd({jobName: plugin.getJobName()});
                    }
                }, 5000
            )
        }
    }
}
