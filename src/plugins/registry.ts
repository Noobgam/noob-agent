export const MYSQL_ANKI_COLLECTOR_PLUGIN_NAME = "mysqlAnkiCollector";
export const PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME = "prometheusAnkiCardCollector";
export const OBSIDIAN_DIARY_PLUGIN_NAME = "obsidianDiaryCollector";
export const WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME = "wanikaniProgressPublisher"

export type AllPluginNames = typeof MYSQL_ANKI_COLLECTOR_PLUGIN_NAME | typeof PROMETHEUS_ANKI_COLLECTOR_PLUGIN_NAME | typeof OBSIDIAN_DIARY_PLUGIN_NAME | typeof WANIKANI_PROGRESS_PUBLISHER_PLUGIN_NAME;
type PluginConfig = {
    enabled: boolean;
}

export type GlobalPluginConfiguration = Partial<Record<AllPluginNames, PluginConfig>>;

