import {Plugin, PluginConfig} from "../plugin";
import {WaniKaniClient} from "../../wanikani/client";
import {AllPluginNames, WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME} from "../registry";
import {ping} from "../../mysql/client";
import {groupBy} from "../../utils/functional";
import {LanguageLearningSnapshot, publishSnapshots} from "../../mysql/language_learning";

export class WanikaniProgressPublisher extends Plugin {
    wanikaniClient: WaniKaniClient;

    constructor(config: PluginConfig, wanikaniClient: WaniKaniClient) {
        super(config);
        this.wanikaniClient = wanikaniClient;
    }

    getName(): AllPluginNames {
        return WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME;
    }

    async executePluginCron(): Promise<void> {
        const date = new Date();
        const assignments = await this.wanikaniClient.fetchAllAssignments();
        const grouped = groupBy(assignments, ass => ass.srs_stage);
        const snapshots: LanguageLearningSnapshot[] = []
        for (let k in grouped) {
            const v = grouped[k]
            snapshots.push({
                language: 'japanese',
                date: date,
                origin: 'wanikani',
                srs_level: parseInt(k),
                count: v.length,
            });
        }
        await publishSnapshots(snapshots);
    }

    getExecutionDelayMs(): number {
        return 30000;
    }

    async readyCheck(): Promise<boolean> {
        return ping();
    }
}


