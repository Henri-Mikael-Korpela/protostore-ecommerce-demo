/**
 * Outcome of an operation that can fail, returned as a value instead of thrown as an exception.
 * Check `ok` before reading `value`, the compiler doesn't allow reading it otherwise.
 */
export type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };

// Same name as the type above, so that `Result` can be imported once and used both as a type and
// for creating values: `Result.ok(value)`, `Result.err(error)`. A `namespace` would do the same
// but isn't allowed with `erasableSyntaxOnly`.
export const Result = {
    ok<T>(value: T): Result<T, never> {
        return {
            ok: true,
            value,
        };
    },

    err<E>(error: E): Result<never, E> {
        return {
            ok: false,
            error,
        };
    },
};
