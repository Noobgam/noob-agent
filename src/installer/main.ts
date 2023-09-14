import { Service } from "node-windows"
import path from "path";

export const AnkiService = new Service({
    name: 'Noob agent',
    description: 'Noob agent.',
    script: path.join(process.cwd(), 'dist', 'bundle.cjs'),
    //, workingDirectory: '...'
    //, allowServiceLogon: true
    env: [{
        name: 'NO_COLOR',
        value: 'true',
    }]
});

