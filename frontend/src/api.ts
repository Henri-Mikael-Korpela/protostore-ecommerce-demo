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
    let result = `${BASE_URL}${request.path}`;
    if (Object.keys(request.queryParams).length > 0) {
        const queryParamEntries: string[] = [];
        for (const [key, value] of Object.entries(request.queryParams)) {
            queryParamEntries.push(`${key}=${value}`);
        }
        result += "?" + queryParamEntries.join("&");
    }
    return result;
}

type GetBooksResponseDtoElement = {
    isbn: string;
    title: string;
}

export function getBooks(search: string): Promise<GetBooksResponseDtoElement[]> {
    return buildApiRequest<GetBooksResponseDtoElement[]>({
        headers: {
            "Content-Type": "application/json"
        },
        path: "/api/books",
        queryParams: { search }
    })
        .then(result => result)
        .catch(() => []);
}