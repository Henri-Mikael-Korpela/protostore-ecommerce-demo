import { Result } from "./result.ts";

export type UrlOptions = {
    baseUrl: string;
    /** Must already be percent-encoded where it contains user-provided values. */
    path: string;
    /** Keys and values are percent-encoded when the URL is built. */
    queryParams?: Record<string, string>;
};

export function buildUrl(options: UrlOptions): string {
    const baseUrlAndPath = options.baseUrl + options.path;

    const queryParamEntries: string[] = [];
    for (const [key, value] of Object.entries(options.queryParams ?? {})) {
        queryParamEntries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    if (queryParamEntries.length === 0) {
        return baseUrlAndPath;
    }

    return baseUrlAndPath + "?" + queryParamEntries.join("&");
}

/**
 * `decodeURIComponent` returning an error value for malformed input such as `%E0`, instead of throwing.
 */
export function decodeUriComponent(value: string): Result<string, URIError> {
    try {
        return Result.ok(decodeURIComponent(value));
    } catch (error) {
        // decodeURIComponent throws only URIError, anything else is a bug
        if (!(error instanceof URIError)) {
            throw error;
        }
        return Result.err(error);
    }
}
