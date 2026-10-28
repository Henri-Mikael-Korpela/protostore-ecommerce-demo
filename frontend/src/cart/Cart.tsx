import { useState } from 'react';

import type { CartItem } from "./useCart.ts";

export function Cart({ items, itemCount, onRemove }: {
    items: CartItem[];
    itemCount: number;
    onRemove: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="cart">
            <button
                type="button"
                className="cart-button"
                aria-label={`Shopping cart, ${itemCount} items`}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                <span className="cart-icon" aria-hidden="true" />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
            {open &&
                <div className="cart-panel">
                    {items.length === 0
                        ? <p className="cart-empty">Your cart is empty.</p>
                        : items.map(item =>
                            <div key={item.id} className="cart-item">
                                <span className="cart-item-title">{item.title}</span>
                                <span className="cart-item-quantity">×{item.quantity}</span>
                                <button
                                    type="button"
                                    className="cart-item-remove"
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
