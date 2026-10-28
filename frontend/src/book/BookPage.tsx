import { useEffect, useState } from "react";

import * as api from "../api.ts";
import type { EndpointResponseAwaited } from "../api.ts";
import { Link } from "../router.tsx";
import { BookCover } from "./BookCover.tsx";

type Book = NonNullable<EndpointResponseAwaited<'getBook'>>;

export function BookPage({ bookId, onAddToCart }: { bookId: string; onAddToCart: (book: Book) => void; }) {
    // undefined while loading (state local to this component), null when the book was not found (API result)
    const [book, setBook] = useState<Book | null | undefined>(undefined);

    useEffect(() => {
        let ignore = false;

        async function load() {
            const result = await api.getBook(bookId);
            if (!ignore) {
                setBook(result);
            }
        }

        setBook(undefined);
        load();

        return () => {
            ignore = true;
        };
    }, [bookId]);

    if (book === undefined) {
        return <p className="book-page-status">Loading book...</p>;
    }
    if (book === null) {
        return (
            <section className="book-page-status">
                <h1>Book not found</h1>
                <p>The book you are looking for does not exist.</p>
                <Link to="/" className="book-page-back">Back to the store</Link>
            </section>
        );
    }

    return (
        <article className="book-page">
            <BookCover key={book.isbn} isbn={book.isbn} title={book.title} size="large" />

            <div className="book-page-details">
                <Link to="/" className="book-page-back">← Back to the store</Link>
                <h1 className="book-page-title">{book.title}</h1>
                <dl className="book-page-info">
                    <dt>ISBN</dt>
                    <dd>{book.isbn || "Not available"}</dd>
                </dl>
                <div className="book-page-actions">
                    <button type="button" className="banner-cta" onClick={() => onAddToCart(book)}>
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    );
}
