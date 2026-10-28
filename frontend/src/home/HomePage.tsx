import { useEffect, useState } from "react";

import * as api from "../api.ts";
import type { ApiError, EndpointValue } from "../api.ts";
import { BookCover } from "../book/BookCover.tsx";
import { bookPath, Link } from "../router.tsx";

import styles from "./HomePage.module.css";

type Book = EndpointValue<'getFeaturedBooks'>[number];

type FeaturedBooksState =
    | { kind: "loading" }
    | { kind: "loaded"; books: Book[] }
    | { kind: "failed"; error: ApiError };

function FeaturedBook({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book, source: HTMLElement) => void; }) {
    return (
        <article className={styles.book}>
            <Link to={bookPath(book.id)} className={styles.bookLink}>
                <BookCover key={book.isbn} isbn={book.isbn} title={book.title} size="large" />
                <h3 className={styles.bookTitle}>{book.title}</h3>
            </Link>
            <button type="button" className="primary-button" onClick={e => onAddToCart(book, e.currentTarget)}>
                Add to cart
            </button>
        </article>
    );
}

export function HomePage({ onAddToCart }: { onAddToCart: (book: Book, source: HTMLElement) => void; }) {
    const [state, setState] = useState<FeaturedBooksState>({
        kind: "loading",
    });
    // Incremented to load the featured books again after a failure
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let ignore = false;

        async function load() {
            const result = await api.getFeaturedBooks();
            if (ignore) {
                return;
            }
            if (result.ok) {
                setState({
                    kind: "loaded",
                    books: result.value,
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
    }, [attempt]);

    switch (state.kind) {
        case "loading":
            return <p className={styles.status}>Loading featured books...</p>;
        case "failed":
            return (
                <section className={styles.status} role="alert">
                    <p>{api.apiErrorMessage(state.error)}</p>
                    <button type="button" className="primary-button" onClick={() => setAttempt(attempt + 1)}>
                        Try again
                    </button>
                </section>
            );
        case "loaded":
            if (state.books.length === 0) {
                return <p className={styles.status}>There are no featured books at the moment.</p>;
            }
            return (
                <section className={styles.featuredBooks}>
                    <h2 className={styles.heading}>Featured books</h2>
                    <div className={styles.list}>
                        {state.books.map(book =>
                            <FeaturedBook key={book.id} book={book} onAddToCart={onAddToCart} />
                        )}
                    </div>
                </section>
            );
    }
}
