import { useCallback, useEffect, useState } from "react";

export type CartItem = {
    isbn: string;
    title: string;
    quantity: number;
};

const STORAGE_KEY = "protostore.cart";

function loadCart(): CartItem[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) as CartItem[] : [];
    } catch {
        return [];
    }
}

function withBookAdded(items: CartItem[], book: { isbn: string; title: string }): CartItem[] {
    const result: CartItem[] = [];

    let found = false;
    for (const item of items) {
        if (item.isbn === book.isbn) {
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
            isbn: book.isbn,
            title: book.title,
            quantity: 1,
        });
    }

    return result;
}

function withIsbnRemoved(items: CartItem[], isbn: string): CartItem[] {
    const result: CartItem[] = [];

    for (const item of items) {
        if (item.isbn !== isbn) {
            result.push(item);
        }
    }

    return result;
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(loadCart);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Storage unavailable; the cart still works for this session
        }
    }, [items]);

    const addItem = useCallback((book: { isbn: string; title: string }) => {
        setItems(current => withBookAdded(current, book));
    }, []);

    const removeItem = useCallback((isbn: string) => {
        setItems(current => withIsbnRemoved(current, isbn));
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
