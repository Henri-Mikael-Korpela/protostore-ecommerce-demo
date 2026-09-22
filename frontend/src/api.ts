import { type BookDto } from "@protostore/dto/BookDto.java";
// Type-only self-import, used to derive endpoint names from this module's exports
import type * as api from "./api.ts";

type RequestOptions = {
    path: string;
    queryParams?: Record<string, string>;
};

type Request<HeaderT extends Record<string, string> = Record<string, string>> = RequestOptions & {
    headers?: HeaderT;
}

const BASE_URL = "http://localhost:8080";

function buildApiRequest<ResponseSuccess, HeaderT extends Record<string, string> = Record<string, string>>(
    request: Request<HeaderT>
): Promise<ResponseSuccess> {
    const uri = buildApiRequestURI({
        path: request.path,
        queryParams: request.queryParams,
    });
    return fetch(uri, {
        headers: request.headers
    })
        .then(async (value: Response) => {
            if (request.headers?.["Content-Type"] === "application/json") {
                return await value.json() as ResponseSuccess;
            }
            throw "Unimplemented yet";
        })
        // TODO: Better approach to error handling
        .catch(() => undefined);
}

function buildApiRequestURI(request: RequestOptions): string {
    let result = BASE_URL + request.path;
    if (Object.keys(request.queryParams).length > 0) {
        const queryParamEntries: string[] = [];
        for (const [key, value] of Object.entries(request.queryParams)) {
            queryParamEntries.push(`${key}=${value}`);
        }
        result += "?" + queryParamEntries.join("&");
    }
    return result;
}

type Endpoint = (...args: any[]) => Promise<any>;

/**
 * Names of the exported values of this module that are endpoints.
 */
export type EndpointName = {
    [K in keyof typeof api]: typeof api[K] extends Endpoint ? K : never;
}[keyof typeof api];

export type EndpointResponseAwaited<N extends EndpointName> = Awaited<ReturnType<typeof api[N]>>;

/// Project specific API endpoints

export async function getBooks(search: string): Promise<BookDto[]> {
    try {
        return await buildApiRequest({
            headers: {
                "Content-Type": "application/json"
            },
            path: "/api/books",
            queryParams: {search}
        });
    } catch {
        return [];
    }
}
