import { useEffect, useState } from "react";

import * as api from "../api.ts";
import type { ApiError, EndpointValue } from "../api.ts";
import { BookCover } from "../book/BookCover.tsx";
import { bookPath, Link } from "../router.tsx";

type Book = EndpointValue<'getFeaturedBooks'>[number];

type FeaturedBooksState =
    | { kind: "loading" }
    | { kind: "loaded"; books: Book[] }
    | { kind: "failed"; error: ApiError };

function FeaturedBook({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book) => void; }) {
    return (
        <article className="featured-book">
            <Link to={bookPath(book.id)} className="featured-book-link">
                <BookCover key={book.isbn} isbn={book.isbn} title={book.title} size="large" />
                <h3 className="featured-book-title">{book.title}</h3>
            </Link>
            <button type="button" className="primary-button" onClick={() => onAddToCart(book)}>
                Add to cart
            </button>
        </article>
    );
}

export function HomePage({ onAddToCart }: { onAddToCart: (book: Book) => void; }) {
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
            return <p className="home-status">Loading featured books...</p>;
        case "failed":
            return (
                <section className="home-status" role="alert">
                    <p>{api.apiErrorMessage(state.error)}</p>
                    <button type="button" className="primary-button" onClick={() => setAttempt(attempt + 1)}>
                        Try again
                    </button>
                </section>
            );
        case "loaded":
            if (state.books.length === 0) {
                return <p className="home-status">There are no featured books at the moment.</p>;
            }
            return (
                <section className="featured-books">
                    <h2 className="featured-books-heading">Featured books</h2>
                    <div className="featured-books-list">
                        {state.books.map(book =>
                            <FeaturedBook key={book.id} book={book} onAddToCart={onAddToCart} />
                        )}
                    </div>
                </section>
            );
    }
}
