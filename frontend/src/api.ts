import { type BookDto } from "@protostore/dto/BookDto.java";
// Type-only self-import, used to derive endpoint names from this module's exports
import type * as api from "./api.ts";
import { buildUrl, type UrlOptions } from "./url.ts";

type Request<HeaderT extends Record<string, string> = Record<string, string>> = Omit<UrlOptions, "baseUrl"> & {
    headers?: HeaderT;
}

const BASE_URL = "http://localhost:8080";

async function buildApiRequest<ResponseSuccess, HeaderT extends Record<string, string> = Record<string, string>>(
    request: Request<HeaderT>
): Promise<ResponseSuccess | undefined> {
    let result: ResponseSuccess | undefined;

    const uri = buildUrl({
        baseUrl: BASE_URL,
        path: request.path,
        queryParams: request.queryParams,
    });
    try {
        const response = await fetch(uri, {
            headers: request.headers,
        });
        // Only JSON responses are supported yet
        if (response.ok && request.headers?.["Content-Type"] === "application/json") {
            result = await response.json() as ResponseSuccess;
        }
    } catch {
        // TODO: Better approach to error handling
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
    const books = await buildApiRequest<BookDto[]>({
        headers: {
            "Content-Type": "application/json",
        },
        path: "/api/books",
        queryParams: {
            search,
        },
    });

    return books ?? [];
}

/**
 * Resolves to `null` when the book does not exist or the request fails.
 */
export async function getBook(id: string): Promise<BookDto | null> {
    const book = await buildApiRequest<BookDto>({
        headers: {
            "Content-Type": "application/json",
        },
        path: `/api/books/${encodeURIComponent(id)}`,
    });

    return book ?? null;
}
