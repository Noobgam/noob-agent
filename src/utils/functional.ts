import {getGlobalLog} from "../config";

export function noopConcurrentInterval(name: string, callable: () => Promise<void>, intervalMs: number) {
    let running = false;
    setInterval(
        async () => {
            if (running) {
                getGlobalLog().info(`Rejecting execution because [${name}] is already running`)
                return;
            }
            try {
                running = true;
                await callable();
            } catch (e: any) {
                getGlobalLog().error(e);
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

export function groupBy<T, K extends keyof any>(array: T[], getKey: (item: T) => K): Record<K, T[]> {
    return array.reduce((accumulator, item) => {
        const key = getKey(item);
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(item);
        return accumulator;
    }, {} as Record<K, T[]>);
}
