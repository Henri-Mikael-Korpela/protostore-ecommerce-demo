import { useEffect, useState } from "react";

import * as api from "../api.ts";
import type { ApiError, EndpointValue } from "../api.ts";
import { Link } from "../router.tsx";
import { BookCover } from "./BookCover.tsx";

import styles from "./BookPage.module.css";

type Book = EndpointValue<'getBook'>;

type BookState =
    | { kind: "loading" }
    | { kind: "loaded"; book: Book }
    | { kind: "failed"; error: ApiError };

function isBookMissing(error: ApiError): boolean {
    // The ID is the only input of the endpoint, so 400 means the ID is not a valid book ID
    return error.kind === "http" && (error.status === 404 || error.status === 400);
}

function BookLoadError({ error, onRetry }: { error: ApiError; onRetry: () => void; }) {
    if (isBookMissing(error)) {
        return (
            <section className={styles.status}>
                <h1>Book not found</h1>
                <p>The book you are looking for does not exist.</p>
                <Link to="/" className={styles.back}>Back to the store</Link>
            </section>
        );
    }

    return (
        <section className={styles.status} role="alert">
            <h1>Could not load the book</h1>
            <p>{api.apiErrorMessage(error)}</p>
            <div className={styles.statusActions}>
                <button type="button" className="primary-button" onClick={onRetry}>
                    Try again
                </button>
                <Link to="/" className={styles.back}>Back to the store</Link>
            </div>
        </section>
    );
}

function BookDetails({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book, source: HTMLElement) => void; }) {
    return (
        <article className={styles.page}>
            <BookCover key={book.isbn} isbn={book.isbn} title={book.title} size="large" />

            <div className={styles.details}>
                <Link to="/" className={styles.back}>← Back to the store</Link>
                <h1 className={styles.title}>{book.title}</h1>
                <dl className={styles.info}>
                    <dt>ISBN</dt>
                    <dd>{book.isbn ?? "Not available"}</dd>
                </dl>
                <div className={styles.actions}>
                    <button type="button" className="primary-button" onClick={e => onAddToCart(book, e.currentTarget)}>
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    );
}

export function BookPage({ bookId, onAddToCart }: {
    bookId: string;
    onAddToCart: (book: Book, source: HTMLElement) => void;
}) {
    const [state, setState] = useState<BookState>({
        kind: "loading",
    });
    // Incremented to load the book again after a failure
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let ignore = false;

        async function load() {
            const result = await api.getBook(bookId);
            if (ignore) {
                return;
            }
            if (result.ok) {
                setState({
                    kind: "loaded",
                    book: result.value,
                });
            } else {
                setState({
                    kind: "failed",
                    error: result.error,
                });
            }
        }

        setState({
            kind: "loading",
        });
        void load();

        return () => {
            ignore = true;
        };
    }, [bookId, attempt]);

    switch (state.kind) {
        case "loading":
            return <p className={styles.status}>Loading book...</p>;
        case "failed":
            return <BookLoadError error={state.error} onRetry={() => setAttempt(attempt + 1)} />;
        case "loaded":
            return <BookDetails book={state.book} onAddToCart={onAddToCart} />;
    }
}
