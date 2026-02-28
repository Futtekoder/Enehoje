type Entry<T> = { value: T; ts: number };

const store = new Map<string, Entry<any>>();

const SOFT_TTL_MS = 5 * 60 * 1000;
const HARD_TTL_MS = 60 * 60 * 1000;

export function cacheGet<T>(key: string): T | null {
    const e = store.get(key);
    if (!e) return null;
    const age = Date.now() - e.ts;
    if (age > HARD_TTL_MS) {
        store.delete(key);
        return null;
    }
    return e.value as T;
}

export function cacheIsFresh(key: string): boolean {
    const e = store.get(key);
    if (!e) return false;
    return Date.now() - e.ts <= SOFT_TTL_MS;
}

export function cacheSet<T>(key: string, value: T) {
    store.set(key, { value, ts: Date.now() });
}
