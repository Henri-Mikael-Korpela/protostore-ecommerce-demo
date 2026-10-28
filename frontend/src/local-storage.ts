import {parseJsonOrDefault} from "./json.ts";
import type {CartItem} from "./cart/useCart.ts";

const STORAGE_KEY = "protostore.cart";

function getLocalStorageItem(key: string): string | undefined {
    try {
        return localStorage.getItem(key) ?? undefined;
    } catch {
        return undefined;
    }
}

export function getCartItemsFromLocalStorage(): CartItem[] {
    const result: CartItem[] = [];

    const stored = getLocalStorageItem(STORAGE_KEY);
    if (stored !== undefined && stored.length > 0) {
        const parsed = parseJsonOrDefault<unknown[]>(stored, []);
        for (const item of parsed) {
            // Carts stored before items were identified by book ID have no ID and are dropped
            if (isCartItem(item)) {
                result.push(item);
            }
        }
    }

    return result;
}

function isCartItem(value: unknown): value is CartItem {
    let result = false;

    if (typeof value === "object" && value !== null) {
        const item = value as Partial<Record<keyof CartItem, unknown>>;
        result = typeof item.id === "string"
            && typeof item.title === "string"
            && typeof item.quantity === "number";
    }

    return result;
}

export function setCartItemsToLocalStorage(items: CartItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Storage unavailable; the cart still works for this session
    }
}
