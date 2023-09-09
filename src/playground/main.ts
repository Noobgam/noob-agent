import {AnkiClient} from "../anki/client";
import {globalConfig} from "../config";

const ankiClient = new AnkiClient(globalConfig.anki);
console.log(await ankiClient.getDeckNames()
    .then(deckName => deckName.result))
