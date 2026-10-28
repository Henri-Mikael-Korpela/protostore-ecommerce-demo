// Visual cue for adding a book to the cart: a translucent copy of the book's cover flies to the cart
// icon, which then briefly grows and changes color. The copy lives outside of React, in the document
// body, because it only exists for a moment and no component needs to know about it.

/** ID of the element the cover flies to. Set by the Cart component. */
export const CART_BUTTON_ID = "cart-button";

/** Class of the cover images, set by the BookCover component. */
const COVER_SELECTOR = ".book-cover";

const FLY_DURATION_MS = 700;

const BUMP_DURATION_MS = 400;

const FLYING_COVER_OPACITY = 0.6;

/**
 * Nearest cover in the surroundings of the element that was clicked: the first ancestor that
 * contains one. For a button in a list this is the book's own entry, not the whole list.
 */
function findCover(source: Element): Element | undefined {
    let container = source.parentElement;
    while (container !== null) {
        const cover = container.querySelector(COVER_SELECTOR);
        if (cover !== null) {
            return cover;
        }
        container = container.parentElement;
    }

    return undefined;
}

function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Quick size and color change of the cart. Only the color changes if the user prefers reduced motion.
 */
function bumpCart(cartButton: HTMLElement): void {
    const grownScale = prefersReducedMotion() ? 1 : 1.3;

    cartButton.animate([
        {
            transform: "scale(1)",
            color: "var(--text-h)",
        },
        {
            transform: `scale(${grownScale})`,
            color: "var(--accent)",
            offset: 0.4,
        },
        {
            transform: "scale(1)",
            color: "var(--text-h)",
        },
    ], {
        duration: BUMP_DURATION_MS,
        easing: "ease-out",
    });
}

/**
 * Plays the add to cart animation, starting from the cover closest to `source`, e.g. the clicked button.
 * Does nothing if the cart is not on the page.
 */
export function flyToCart(source: Element): void {
    const cartButton = document.getElementById(CART_BUTTON_ID);
    if (cartButton === null) {
        return;
    }

    const cover = findCover(source);
    if (cover === undefined || prefersReducedMotion()) {
        bumpCart(cartButton);
        return;
    }

    const clone = cover.cloneNode(true);
    if (!(clone instanceof HTMLElement)) {
        bumpCart(cartButton);
        return;
    }

    const from = cover.getBoundingClientRect();
    const to = cartButton.getBoundingClientRect();
    const deltaX = (to.left + to.width / 2) - (from.left + from.width / 2);
    const deltaY = (to.top + to.height / 2) - (from.top + from.height / 2);
    const endScale = Math.min(to.width / from.width, to.height / from.height);

    // The original has already been loaded, so the copy doesn't need to be loaded lazily
    clone.removeAttribute("loading");
    clone.setAttribute("aria-hidden", "true");
    clone.classList.add("flying-cover");
    Object.assign(clone.style, {
        top: `${from.top}px`,
        left: `${from.left}px`,
        width: `${from.width}px`,
        height: `${from.height}px`,
    });
    document.body.appendChild(clone);

    const animation = clone.animate([
        {
            transform: "translate(0, 0) scale(1)",
            opacity: FLYING_COVER_OPACITY,
        },
        {
            // Rises on the way, so the cover flies in an arc
            transform: `translate(${deltaX / 2}px, ${deltaY / 2 - 60}px) scale(${(1 + endScale) / 2})`,
            opacity: FLYING_COVER_OPACITY,
            offset: 0.5,
        },
        {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${endScale})`,
            opacity: 0.2,
        },
    ], {
        duration: FLY_DURATION_MS,
        easing: "ease-in-out",
    });

    animation.addEventListener("finish", () => {
        clone.remove();
        bumpCart(cartButton);
    }, {
        once: true,
    });
    // Removes the copy if the animation never finishes, so it isn't left on the page
    animation.addEventListener("cancel", () => {
        clone.remove();
    }, {
        once: true,
    });
}
