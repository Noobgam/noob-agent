import {AnkiClient} from "../anki/client";
import {getGlobalLog, globalConfig} from "../config";
import {RawAnkiCardType} from "../models/anki";
import {jlptCards} from "./jlpt_cards";

async function doStuff() {
    const ankiClient = new AnkiClient(globalConfig.anki);
    const deckName = "Japanese::JLPT Sensei::L2_N4";
    const language = 'jp';
    let tags = ["autogenerated"]
    await ankiClient.createDeck(deckName);

    tags = [...tags, `language_${language.toLowerCase()}`];
    const cards: RawAnkiCardType[] = jlptCards;

    const notes = cards.map(card => {
        return {
            deckName,
            modelName: `Playground_JLPT_Sensei`,
            fields: card,
            tags
        }
    });
    await ankiClient.addNotes(notes)

    getGlobalLog().info(cards);
}

doStuff().then(
    r => {
            console.log(r)
    }
).catch(
    e => {
        console.log(e)
    }
)