import { useState } from "react";

import { buildUrl } from "../url.ts";

const COVERS_BASE_URL = "https://covers.openlibrary.org";

// There are no cover images in the database yet, so covers are looked up from the Open Library
// Covers API by ISBN. `default=false` makes it respond 404 instead of a blank image when it has
// no cover, which triggers the placeholder below.
function coverUrl(isbn: string, size: "small" | "large"): string {
    const sizeCode = size === "small" ? "S" : "L";

    return buildUrl({
        baseUrl: COVERS_BASE_URL,
        path: `/b/isbn/${encodeURIComponent(isbn)}-${sizeCode}.jpg`,
        queryParams: {
            default: "false",
        },
    });
}

/**
 * Remount with a `key` when the ISBN changes, so a previous load failure doesn't carry over.
 */
export function BookCover({ isbn, title, size }: { isbn: string | null; title: string; size: "small" | "large"; }) {
    const [failed, setFailed] = useState(false);

    const className = `book-cover book-cover-${size}`;
    if (!isbn || failed) {
        return (
            <div className={`${className} book-cover-placeholder`} aria-hidden="true">
                {size === "large" && <span className="cover-title">{title}</span>}
            </div>
        );
    }

    return (
        <img
            className={className}
            src={coverUrl(isbn, size)}
            alt={size === "large" ? `Cover of ${title}` : ""}
            loading="lazy"
            onError={() => setFailed(true)}
        />
    );
}
