import { useCallback, useEffect, useState } from "react";

import {getCartItemsFromLocalStorage, setCartItemsToLocalStorage} from "../local-storage.ts";

export type CartItem = {
    id: string;
    title: string;
    quantity: number;
};

function withBookAdded(items: CartItem[], book: { id: string; title: string }): CartItem[] {
    const result: CartItem[] = [];

    let found = false;
    for (const item of items) {
        if (item.id === book.id) {
            result.push({
                ...item,
                quantity: item.quantity + 1,
            });
            found = true;
        } else {
            result.push(item);
        }
    }
    if (!found) {
        result.push({
            id: book.id,
            title: book.title,
            quantity: 1,
        });
    }

    return result;
}

function withIdRemoved(items: CartItem[], id: string): CartItem[] {
    const result: CartItem[] = [];

    for (const item of items) {
        if (item.id !== id) {
            result.push(item);
        }
    }

    return result;
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(getCartItemsFromLocalStorage);

    useEffect(() => {
        setCartItemsToLocalStorage(items);
    }, [items]);

    const addItem = useCallback((book: { id: string; title: string }) => {
        setItems(current => withBookAdded(current, book));
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(current => withIdRemoved(current, id));
    }, []);

    let itemCount = 0;
    for (const item of items) {
        itemCount += item.quantity;
    }

    return {
        items,
        itemCount,
        addItem,
        removeItem,
    };
}
