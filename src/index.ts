import {globalConfig, log} from './config'
import {AnkiClient} from "./anki/client";
import {Executor} from "./plugins/executor/executor";
import {AnkiClickhousePlugin} from "./plugins/anki/clickhouse_plugin";
import {clickHouseClient} from "./clickhouse/client";
import {AnkiPromPlugin} from "./plugins/anki/prom_plugin";

const ankiClient = new AnkiClient(globalConfig.anki);
new Executor(
    [
        new AnkiClickhousePlugin(ankiClient, clickHouseClient),
        new AnkiPromPlugin(ankiClient),
    ],
    globalConfig.prometheus,
)
log.info("Started successfully");
