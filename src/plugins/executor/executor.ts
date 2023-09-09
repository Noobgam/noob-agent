import {Plugin, PrometheusPlugin} from "../plugin";
import {noopConcurrentInterval} from "../../utils/functional";
import {Pushgateway} from "prom-client";
import {PrometheusConfig} from "../../prometheus/config";

export class Executor {
    registeredPlugins: Plugin[];
    prometheusConfig: PrometheusConfig;

    constructor(plugins: Plugin[], prometheusConfig: PrometheusConfig) {
        this.registeredPlugins = [];
        this.prometheusConfig = prometheusConfig;
        plugins.forEach(plugin => this.registerPlugin(plugin))
    }

    registerPlugin(plugin: Plugin) {
        // we don't want to actually wait for the first interval, right
        noopConcurrentInterval(
            plugin.getName(),
            async () => {
                try {
                    await plugin.executePluginCron();
                } catch (e) {
                    console.log(e);
                }
            }, plugin.getExecutionDelayMs()
        )
        if (plugin instanceof PrometheusPlugin) {
            console.log(`Registering prometheus plugin`);
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
                        console.log(await plugin.getRegistry().metrics())
                    } else {
                        await client.pushAdd({jobName: plugin.getJobName()});
                    }
                }, 5000
            )
        }
    }
}