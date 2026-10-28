export type UrlOptions = {
    baseUrl: string;
    /** Must already be percent-encoded where it contains user-provided values. */
    path: string;
    /** Keys and values are percent-encoded when the URL is built. */
    queryParams?: Record<string, string>;
};

export function buildUrl(options: UrlOptions): string {
    let result = options.baseUrl + options.path;

    const queryParams = options.queryParams ?? {};
    if (Object.keys(queryParams).length > 0) {
        const queryParamEntries: string[] = [];
        for (const [key, value] of Object.entries(queryParams)) {
            queryParamEntries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
        result += "?" + queryParamEntries.join("&");
    }

    return result;
}
