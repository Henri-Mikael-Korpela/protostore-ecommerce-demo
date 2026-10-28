export function parseJsonOrDefault<T, U = T>(value: string, defaultValue: U): T | U {
    try {
        return JSON.parse(value) as T;
    } catch {
        return defaultValue as U; // `as` is not necessary but it adds clarity
    }
}