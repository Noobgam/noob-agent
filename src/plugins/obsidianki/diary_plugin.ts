import {Plugin} from "../plugin";
import {ObsidianClient} from "../../obsidian/client";
import {AnkiClient} from "../../anki/client";
import {log} from "../../config";
import {MonorepoClient} from "../../noobgam/monorepo_client";

export type ObsidianDiaryPluginConfig = {
    languageDiariesPrefix: string;
    unprocessedTag: string;
    processedTag: string;
}

export class ObsidianDiaryPlugin extends Plugin {

    ankiClient: AnkiClient
    obsidianClient: ObsidianClient
    monorepoClient: MonorepoClient;
    config: ObsidianDiaryPluginConfig;

    constructor(ankiClient: AnkiClient, obsidianClient: ObsidianClient, monorepoClient: MonorepoClient, config: ObsidianDiaryPluginConfig) {
        super();
        this.ankiClient = ankiClient;
        this.obsidianClient = obsidianClient;
        this.monorepoClient = monorepoClient;
        this.config = config;
    }

    private async collectFiles(prefix: string): Promise<string[]> {
        const res = await this.obsidianClient.searchFilesByText(this.config.unprocessedTag);
        return res.filter(x => x.startsWith(prefix))
    }

    getName(): string {
        return "obsidianDiary";
    }

    async executePluginCron(): Promise<void> {
        const listOfFiles = await this.collectFiles(this.config.languageDiariesPrefix);
        log.info(`Detected unprocessed files: ${listOfFiles}`);
        for (let fileName of listOfFiles) {
            const fileContent = await this.obsidianClient.getFile(fileName);

            const cards = await this.monorepoClient.convertDiaryToCards(fileContent);
            let tags = ["autogenerated"]
            const language =
                fileName.indexOf('Deutsch') !== -1
                    ? 'German'
                    : fileName.indexOf('Japanese') !== -1
                        ? 'Japanese'
                        : undefined;
            if (!language) {
                continue;
            }
            tags = [...tags, `language_${language.toLowerCase()}`]
            const parts = fileName.split('/');

            const deckName = `Noobgam::Diary::${language}::${parts[parts.length - 1]}`;
            await this.ankiClient.createDeck(deckName)
            const notes = cards.map(card => {
                return {
                    deckName,
                    modelName: `Autogenerated_Core_${language}`,
                    fields: card,
                    tags
                }
            });
            await this.ankiClient.addNotes(notes)
            log.info(cards);

            fileContent.replaceAll(this.config.unprocessedTag, this.config.processedTag);
            await this.obsidianClient.putFile(
                fileName,
                fileContent.replaceAll(this.config.unprocessedTag, this.config.processedTag)
            )
        }

    }

    getExecutionDelayMs(): number {
        return 5000;
    }
}