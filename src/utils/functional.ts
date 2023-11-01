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
            } catch (e: any) {
                log.error(e);
            } finally {
                running = false;
            }
        },
        intervalMs
    )
}

export function throwException<T>(msg: string): T {
    throw new Error(msg)
}

export function partition<T>(array: T[], isValid: (elem: T) => boolean): [T[], T[]] {
    const pass: T[] = [], fail: T[] = [];
    array.forEach((e) => (isValid(e) ? pass : fail).push(e));
    return [pass, fail];
}
