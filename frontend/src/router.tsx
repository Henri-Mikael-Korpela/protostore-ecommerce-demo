import { useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

import { decodeUriComponent } from "./url.ts";

// Minimal client-side router built on the History API. Vite's dev server falls back to
// index.html for unknown paths, so deep links such as /books/<id> load the app directly.

function subscribe(callback: () => void): () => void {
    window.addEventListener("popstate", callback);
    return () => window.removeEventListener("popstate", callback);
}

function getPath(): string {
    return window.location.pathname;
}

export function usePath(): string {
    return useSyncExternalStore(subscribe, getPath);
}

export function navigate(path: string): void {
    if (path === getPath()) {
        return;
    }
    window.history.pushState(null, "", path);
    // pushState does not fire popstate itself, so notify subscribers manually
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
}

export function Link({ to, className, children }: { to: string; className?: string; children: ReactNode; }) {
    function onClick(e: MouseEvent<HTMLAnchorElement>) {
        // Let the browser handle opening in a new tab or window
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
        }
        e.preventDefault();
        navigate(to);
    }

    return <a href={to} className={className} onClick={onClick}>{children}</a>;
}

/// Project specific routes

const BOOK_PATH_PREFIX = "/books/";

export function bookPath(bookId: string): string {
    return BOOK_PATH_PREFIX + encodeURIComponent(bookId);
}

/**
 * Returns the book ID of a book page path, or undefined if the path is not a book page.
 */
export function matchBookPath(path: string): string | undefined {
    if (!path.startsWith(BOOK_PATH_PREFIX) || path.length === BOOK_PATH_PREFIX.length) {
        return undefined;
    }

    // A malformed percent-encoding can't be a book ID, so such a path is not a book page
    const bookId = decodeUriComponent(path.slice(BOOK_PATH_PREFIX.length));
    if (!bookId.ok) {
        return undefined;
    }

    return bookId.value;
}
