import {getGlobalLog, globalConfig, requiredEnv} from './config'
import {AnkiClient} from "./anki/client";
import {Executor} from "./plugins/executor/executor";
import {ObsidianDiaryPlugin} from "./plugins/obsidianki/diary_plugin";
import {getObsidianClient} from "./obsidian/client";
import {monorepoClient} from "./noobgam/monorepo_client";
import {AnkiPromPlugin} from "./plugins/anki/prom_plugin";
import {AnkiMysqlPlugin} from "./plugins/anki/mysql_plugin";
import {
    GlobalPluginConfiguration,
    MYSQL_ANKI_COLLECTOR_PLUGIN_NAME,
    OBSIDIAN_DIARY_PLUGIN_NAME,
    PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME, WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME
} from "./plugins/registry";
import {WanikaniProgressPublisher} from "./plugins/wanikani/wanikani_progress";
import {WaniKaniClient} from "./wanikani/client";

const ankiClient = new AnkiClient(globalConfig.anki);
const pluginConfig: GlobalPluginConfiguration = {
    [MYSQL_ANKI_COLLECTOR_PLUGIN_NAME]: {
        enabled: true,
    },
    [OBSIDIAN_DIARY_PLUGIN_NAME]: {
        enabled: true,
    },
    [PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME]: {
        enabled: true,
    },
    [WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME]: {
        enabled: true,
    }
}

new Executor(
    pluginConfig,
    [
        new AnkiMysqlPlugin(
            {
                disabled: false
            },
            ankiClient
        ),
        new AnkiPromPlugin(
            {
                disabled: false,
            },
            ankiClient
        ),
        new ObsidianDiaryPlugin(
            {
                disabled: false,
            },
            ankiClient,
            getObsidianClient(),
            monorepoClient,
            {
                languageDiariesPrefix: 'Languages/',
                unprocessedTag: '#unprocessed_obsidianki',
                processedTag: '#processed_obsidianki'
            }
        ),
        new WanikaniProgressPublisher({
            disabled: false,
        }, new WaniKaniClient(requiredEnv("NOOBGAM_WANIKANI_TOKEN"))),
    ],
    globalConfig.prometheus,
)
getGlobalLog().info("Started successfully");
