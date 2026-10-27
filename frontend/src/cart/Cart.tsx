import { useState } from 'react';
import type { CartItem } from "./useCart.ts";

function CartIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6" />
        </svg>
    );
}

export function Cart({ items, itemCount, onRemove }: {
    items: CartItem[];
    itemCount: number;
    onRemove: (isbn: string) => void;
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
                <CartIcon />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
            {open &&
                <div className="cart-panel">
                    {items.length === 0
                        ? <p className="cart-empty">Your cart is empty.</p>
                        : items.map(item =>
                            <div key={item.isbn} className="cart-item">
                                <span className="cart-item-title">{item.title}</span>
                                <span className="cart-item-quantity">×{item.quantity}</span>
                                <button
                                    type="button"
                                    className="cart-item-remove"
                                    aria-label={`Remove ${item.title} from cart`}
                                    onClick={() => onRemove(item.isbn)}
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
