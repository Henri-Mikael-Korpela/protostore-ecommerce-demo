import { parseJson } from "./json.ts";
import type {CartItem} from "./cart/useCart.ts";
import { isNumber, isString, objectOf } from "./validation.ts";

const STORAGE_KEY = "protostore.cart";

const isCartItem = objectOf<CartItem>({
    id: isString,
    title: isString,
    quantity: isNumber,
});

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
        const parsed = parseJson(stored);
        // Storage is user-editable, so anything else than an array is discarded as a whole
        if (parsed.ok && Array.isArray(parsed.value)) {
            const items: unknown[] = parsed.value;
            for (const item of items) {
                // Carts stored before items were identified by book ID have no ID and are dropped
                if (isCartItem(item)) {
                    result.push(item);
                }
            }
        }
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
