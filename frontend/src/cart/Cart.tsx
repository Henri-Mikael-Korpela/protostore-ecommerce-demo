import { useState } from 'react';

import { CART_BUTTON_ID } from "./fly-to-cart.ts";
import type { CartItem } from "./useCart.ts";

import styles from "./Cart.module.css";

export function Cart({ items, itemCount, onRemove }: {
    items: CartItem[];
    itemCount: number;
    onRemove: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.cart}>
            <button
                id={CART_BUTTON_ID}
                type="button"
                className={styles.button}
                aria-label={`Shopping cart, ${itemCount} items`}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                <span className={styles.icon} aria-hidden="true" />
                {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
            </button>
            {open &&
                <div className={styles.panel}>
                    {items.length === 0
                        ? <p className={styles.empty}>Your cart is empty.</p>
                        : items.map(item =>
                            <div key={item.id} className={styles.item}>
                                <span className={styles.itemTitle}>{item.title}</span>
                                <span>×{item.quantity}</span>
                                <button
                                    type="button"
                                    className={styles.itemRemove}
                                    aria-label={`Remove ${item.title} from cart`}
                                    onClick={() => onRemove(item.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        )
                    }
                </div>
            }
        </div>
    );
}
