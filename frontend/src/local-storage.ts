import {parseJsonOrDefault} from "./json.ts";
import type {CartItem} from "./cart/useCart.ts";

const STORAGE_KEY = "protostore.cart";

function getLocalStorageItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function getCartItemsFromLocalStorage(): CartItem[] {
    const stored = getLocalStorageItem(STORAGE_KEY);
    if (typeof stored === "string" && stored.length > 0) {
        return parseJsonOrDefault<CartItem[]>(stored, []);
    } else {
        return [];
    }
}

export function setCartItemsToLocalStorage(items: CartItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Storage unavailable; the cart still works for this session
    }
}