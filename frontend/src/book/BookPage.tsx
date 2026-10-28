import { useEffect, useState } from "react";

import * as api from "../api.ts";
import type { ApiError, EndpointValue } from "../api.ts";
import { Link } from "../router.tsx";
import { BookCover } from "./BookCover.tsx";

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
            <section className="book-page-status">
                <h1>Book not found</h1>
                <p>The book you are looking for does not exist.</p>
                <Link to="/" className="book-page-back">Back to the store</Link>
            </section>
        );
    }

    return (
        <section className="book-page-status" role="alert">
            <h1>Could not load the book</h1>
            <p>{api.apiErrorMessage(error)}</p>
            <div className="book-page-status-actions">
                <button type="button" className="primary-button" onClick={onRetry}>
                    Try again
                </button>
                <Link to="/" className="book-page-back">Back to the store</Link>
            </div>
        </section>
    );
}

function BookDetails({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book) => void; }) {
    return (
        <article className="book-page">
            <BookCover key={book.isbn} isbn={book.isbn} title={book.title} size="large" />

            <div className="book-page-details">
                <Link to="/" className="book-page-back">← Back to the store</Link>
                <h1 className="book-page-title">{book.title}</h1>
                <dl className="book-page-info">
                    <dt>ISBN</dt>
                    <dd>{book.isbn ?? "Not available"}</dd>
                </dl>
                <div className="book-page-actions">
                    <button type="button" className="primary-button" onClick={() => onAddToCart(book)}>
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    );
}

export function BookPage({ bookId, onAddToCart }: { bookId: string; onAddToCart: (book: Book) => void; }) {
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
            return <p className="book-page-status">Loading book...</p>;
        case "failed":
            return <BookLoadError error={state.error} onRetry={() => setAttempt(attempt + 1)} />;
        case "loaded":
            return <BookDetails book={state.book} onAddToCart={onAddToCart} />;
    }
}
