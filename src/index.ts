import {globalConfig} from './config'
import {AnkiClient} from "./plugins/anki/client";
import {Executor} from "./plugins/executor/executor";
import {AnkiPlugin} from "./plugins/anki/plugin";

new Executor(
    [new AnkiPlugin(new AnkiClient(globalConfig.anki))],
    globalConfig.prometheus,
)
