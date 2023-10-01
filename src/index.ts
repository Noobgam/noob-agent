import {globalConfig, log} from './config'
import {AnkiClient} from "./anki/client";
import {Executor} from "./plugins/executor/executor";
import {ObsidianDiaryPlugin} from "./plugins/obsidianki/diary_plugin";
import {getObsidianClient} from "./obsidian/client";
import {monorepoClient} from "./noobgam/monorepo_client";
import {AnkiClickhousePlugin} from "./plugins/anki/clickhouse_plugin";
import {AnkiPromPlugin} from "./plugins/anki/prom_plugin";
import {clickHouseClient} from "./clickhouse/client";

const ankiClient = new AnkiClient(globalConfig.anki);
new Executor(
    [
        new AnkiClickhousePlugin(ankiClient, clickHouseClient),
        new AnkiPromPlugin(ankiClient),
        new ObsidianDiaryPlugin(
            ankiClient,
            getObsidianClient(),
            monorepoClient,
            {
                languageDiariesPrefix: 'Languages/Deutsch/',
                unprocessedTag: '#unprocessed_obsidianki',
                processedTag: '#processed_obsidianki'
            }
        )
    ],
    globalConfig.prometheus,
)
log.info("Started successfully");
