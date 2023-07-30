import {log} from "../config";

export function noopConcurrentInterval(name: string, callable: () => Promise<void>, intervalMs: number) {
    let running = false;
    setInterval(
        async () => {
            if (running) {
                log.info(`Rejecting execution because [${name}] is already running`)
                return;
            }
            try {
                running = true;
                await callable();
            } finally {
                running = false;
            }
        },
        intervalMs
    )
}
