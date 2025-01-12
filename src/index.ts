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
import express, { Express, Request, Response } from 'express';
import {GoogleCalendarClient} from "./calendar/GoogleCalendarClient";

const ankiClient = new AnkiClient(globalConfig.anki);
const pluginConfig: GlobalPluginConfiguration = {
    [MYSQL_ANKI_COLLECTOR_PLUGIN_NAME]: {
        enabled: true,
    },
    [OBSIDIAN_DIARY_PLUGIN_NAME]: {
        enabled: true,
    },
    [PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME]: {
        enabled: false,
    },
    [WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME]: {
        enabled: true,
    }
}

const executor = new Executor(
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
if (process.env["EXECUTOR_START"]) {
    executor.start()
}

const clientSecretFile = process.env['NOOB_AGENT_CLIENT_SECRETS_FILE'];



const app: Express = express();
const port = 3000;

if (clientSecretFile) {
    const googleCalendarScopes = [
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
    ];
    const googleCalendarClient = new GoogleCalendarClient(clientSecretFile, googleCalendarScopes);
    app.get('/calendar/authorize', async (_: Request, res: Response) => {
        await googleCalendarClient.authorize();
        res.send('Authorization successful. You can close this window.');
    });

    app.get('/calendar/getEvents', async (_: Request, res: Response) => {
        try {
            const events = await googleCalendarClient.listEvents();
            res.json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).send('Failed to fetch events.');
        }
    });
} else {
    getGlobalLog().warn("Calendar apis will be disabled due to a lack of secret file")
}

app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
getGlobalLog().info("Started successfully");


