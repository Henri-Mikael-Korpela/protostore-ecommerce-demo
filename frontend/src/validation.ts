// Runtime validation of untrusted data, such as API responses and local storage contents,
// whose static type would otherwise only be an unchecked `as` assertion.

/**
 * Checks whether a value is of type `T`.
 */
export type Validator<T> = {
    (value: unknown): value is T;
    // Never set. Makes `Validator` invariant in `T`, so the compiler rejects e.g. a `Validator<string>`
    // for a `string | null` field. Type guards alone are covariant and would accept it.
    readonly invariance?: (value: T) => T;
};

/**
 * One validator for every property of `T`. A missing property or a validator of a wrong type is a
 * compile error, so validators can't drift from the types they check, e.g. DTOs generated from Java.
 */
export type FieldValidators<T> = {
    [K in keyof T]-?: Validator<T[K]>;
};

export function arrayOf<T>(validator: Validator<T>): Validator<T[]> {
    function validate(value: unknown): value is T[] {
        if (!Array.isArray(value)) {
            return false;
        }

        const items: unknown[] = value;
        for (const item of items) {
            if (!validator(item)) {
                return false;
            }
        }

        return true;
    }

    return validate;
}

export const isString: Validator<string> = (value: unknown): value is string => typeof value === "string";

export const isNumber: Validator<number> = (value: unknown): value is number => typeof value === "number";

export function nullable<T>(validator: Validator<T>): Validator<T | null> {
    function validate(value: unknown): value is T | null {
        return value === null || validator(value);
    }

    return validate;
}

/**
 * Properties not listed in `fields` are allowed, so that the backend can add new ones without
 * breaking older frontends.
 */
export function objectOf<T extends object>(fields: FieldValidators<T>): Validator<T> {
    function validate(value: unknown): value is T {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            return false;
        }

        const record = value as Record<string, unknown>;
        for (const key in fields) {
            if (!fields[key](record[key])) {
                return false;
            }
        }

        return true;
    }

    return validate;
}
