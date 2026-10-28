import { type BookDto } from "@protostore/dto/BookDto.java";
// Type-only self-import, used to derive endpoint names from this module's exports
import type * as api from "./api.ts";
import { parseJson } from "./json.ts";
import { Result } from "./result.ts";
import { buildUrl, type UrlOptions } from "./url.ts";
import { arrayOf, isString, nullable, objectOf, type Validator } from "./validation.ts";

export type ApiError =
    // The request failed and the browser reports having no network connection
    | { kind: "offline" }
    // The request failed before a response was received, e.g. the server is unreachable
    | { kind: "network" }
    | { kind: "timeout" }
    // The server responded with a non-successful HTTP status
    | { kind: "http"; status: number }
    // The response body is not JSON or does not match the expected type
    | { kind: "invalid-response" };

export type ApiResult<T> = Result<T, ApiError>;

type Request<ResponseSuccess, HeaderT extends Record<string, string> = Record<string, string>> = Omit<UrlOptions, "baseUrl"> & {
    headers?: HeaderT;
    /** Checks the parsed response body, which is otherwise untrusted. */
    validator: Validator<ResponseSuccess>;
};

const BASE_URL = "http://localhost:8080";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Converts an error `fetch` or reading the response body rejected with.
 */
function toApiError(error: unknown): ApiError {
    // Both reject only with a TypeError on network failure, or with a DOMException when aborted.
    // The timeout is the only abort signal used here.
    if (error instanceof DOMException && error.name === "TimeoutError") {
        return {
            kind: "timeout",
        };
    } else if (!navigator.onLine) {
        return {
            kind: "offline",
        };
    } else {
        return {
            kind: "network",
        };
    }
}

/**
 * Never rejects.
 */
async function fetchResponseText(uri: string, headers: Record<string, string> | undefined): Promise<ApiResult<string>> {
    try {
        const response = await fetch(uri, {
            headers: {
                Accept: "application/json",
                ...headers,
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (response.ok) {
            return Result.ok(await response.text());
        } else {
            return Result.err({
                kind: "http",
                status: response.status,
            });
        }
    } catch (error) {
        return Result.err(toApiError(error));
    }
}

/**
 * Never rejects. Failures are returned as {@link ApiError} values.
 */
async function buildApiRequest<ResponseSuccess, HeaderT extends Record<string, string> = Record<string, string>>(
    request: Request<ResponseSuccess, HeaderT>
): Promise<ApiResult<ResponseSuccess>> {
    const uri = buildUrl({
        baseUrl: BASE_URL,
        path: request.path,
        queryParams: request.queryParams,
    });
    const text = await fetchResponseText(uri, request.headers);
    if (!text.ok) {
        return text;
    }

    const json = parseJson(text.value);
    if (json.ok && request.validator(json.value)) {
        return Result.ok(json.value);
    } else {
        return Result.err({
            kind: "invalid-response",
        });
    }
}

/**
 * Message to show to the user about a failed request.
 */
export function apiErrorMessage(error: ApiError): string {
    switch (error.kind) {
        case "offline":
            return "You appear to be offline. Check your internet connection and try again.";
        case "network":
            return "Could not reach the store. Please try again.";
        case "timeout":
            return "The store took too long to respond. Please try again.";
        case "http":
            if (error.status >= 500) {
                return "The store is having problems. Please try again later.";
            }
            return `The request failed (HTTP ${error.status}).`;
        case "invalid-response":
            return "The store sent an unexpected response. Please try again later.";
    }
}

type Endpoint = (...args: any[]) => Promise<any>;

/**
 * Names of the exported values of this module that are endpoints.
 */
export type EndpointName = {
    [K in keyof typeof api]: typeof api[K] extends Endpoint ? K : never;
}[keyof typeof api];

export type EndpointResponseAwaited<N extends EndpointName> = Awaited<ReturnType<typeof api[N]>>;

/**
 * Value of a successful response of an endpoint.
 */
export type EndpointValue<N extends EndpointName> = Extract<EndpointResponseAwaited<N>, { ok: true }>["value"];

/// Project specific API endpoints

const isBookDto = objectOf<BookDto>({
    id: isString,
    isbn: nullable(isString),
    title: isString,
});

/**
 * Never rejects.
 */
export async function getBooks(search: string): Promise<ApiResult<BookDto[]>> {
    return buildApiRequest({
        path: "/api/books",
        queryParams: {
            search,
        },
        validator: arrayOf(isBookDto),
    });
}

/**
 * Never rejects. Resolves to an empty array when no book is featured.
 */
export async function getFeaturedBooks(): Promise<ApiResult<BookDto[]>> {
    return buildApiRequest({
        path: "/api/books/featured",
        validator: arrayOf(isBookDto),
    });
}

/**
 * Never rejects. A book that doesn't exist is an `http` error with status 404.
 */
export async function getBook(id: string): Promise<ApiResult<BookDto>> {
    return buildApiRequest({
        path: `/api/books/${encodeURIComponent(id)}`,
        validator: isBookDto,
    });
}
