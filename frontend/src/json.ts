import { Result } from "./result.ts";

/**
 * The parsed value is `unknown`, validate it before use (see validation.ts).
 */
export function parseJson(text: string): Result<unknown, SyntaxError> {
    try {
        const parsed: unknown = JSON.parse(text);
        return Result.ok(parsed);
    } catch (error) {
        // JSON.parse throws only SyntaxError for a string argument, anything else is a bug
        if (!(error instanceof SyntaxError)) {
            throw error;
        }
        return Result.err(error);
    }
}
