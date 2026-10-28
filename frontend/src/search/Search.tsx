import { useEffect, useState, type InputEvent, type KeyboardEvent, type MouseEvent, type SubmitEvent } from "react";

import * as api from "../api.ts";
import type { ApiError, EndpointValue } from "../api.ts";
import { BookCover } from "../book/BookCover.tsx";
import { bookPath, navigate } from "../router.tsx";

type Book = EndpointValue<'getBooks'>[number];

const RESULTS_ID = "search-results";

function resultOptionId(book: Book): string {
    return `search-result-${book.id}`;
}

function SearchResultEntry({ book, active, onOpen, onActivate, onAddToCart }: {
    book: Book;
    active: boolean;
    onOpen: (book: Book) => void;
    onActivate: () => void;
    onAddToCart: (book: Book) => void;
}) {
    function onAddToCartClick(e: MouseEvent<HTMLButtonElement>) {
        // Adding to cart shouldn't also open the book
        e.stopPropagation();
        onAddToCart(book);
    }

    return (
        <div
            id={resultOptionId(book)}
            role="option"
            aria-selected={active}
            className={active ? "search-result-entry active" : "search-result-entry"}
            onClick={() => onOpen(book)}
            onMouseEnter={onActivate}
        >
            <BookCover key={book.isbn} isbn={book.isbn} title={book.title} size="small" />
            <span className="search-result-title">{book.title}</span>
            <button type="button" className="add-to-cart-button" onClick={onAddToCartClick}>
                Add to cart
            </button>
        </div>
    );
}

export function Search({ onAddToCart }: { onAddToCart: (book: Book) => void; }) {
    const [books, setBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    // Index of the result highlighted with the arrow keys or mouse, -1 when none is
    const [activeIndex, setActiveIndex] = useState(-1);
    // Error of the latest search, undefined when it succeeded
    const [searchError, setSearchError] = useState<ApiError | undefined>(undefined);

    useEffect(() => {
        // Ignore responses of outdated queries so results arriving out of order don't overwrite newer ones
        let ignore = false;

        if (searchQuery.length <= 1) {
            setBooks([]);
            setActiveIndex(-1);
            setSearchError(undefined);
            return;
        }

        void (async () => {
            const result = await api.getBooks(searchQuery);
            if (ignore) {
                return;
            }
            setActiveIndex(-1);
            if (result.ok) {
                setBooks(result.value);
                setSearchError(undefined);
            } else {
                setBooks([]);
                setSearchError(result.error);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [searchQuery]);

    useEffect(() => {
        if (activeIndex < 0 || activeIndex >= books.length) {
            return;
        }
        document.getElementById(resultOptionId(books[activeIndex]))?.scrollIntoView({
            block: "nearest",
        });
    }, [activeIndex, books]);

    function openBook(book: Book) {
        setSearchQuery("");
        navigate(bookPath(book.id));
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (books.length === 0) {
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(activeIndex >= books.length - 1 ? 0 : activeIndex + 1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(activeIndex <= 0 ? books.length - 1 : activeIndex - 1);
        }
    }

    // Covers both pressing Enter in the input and clicking the search button
    function onSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < books.length) {
            openBook(books[activeIndex]);
        }
    }

    const showResults = books.length > 0;
    const activeBook = activeIndex >= 0 && activeIndex < books.length ? books[activeIndex] : undefined;

    return (
        <form className="search-bar" onSubmit={onSubmit}>
            <div>
                <input
                    type="search"
                    className="search-input"
                    role="combobox"
                    aria-label="Search books"
                    aria-autocomplete="list"
                    aria-expanded={showResults}
                    aria-controls={RESULTS_ID}
                    aria-activedescendant={activeBook !== undefined ? resultOptionId(activeBook) : undefined}
                    onInput={(e: InputEvent<HTMLInputElement>) => {
                        return setSearchQuery(e.currentTarget.value);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Search for books, authors, or genres..."
                    value={searchQuery}
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </div>
            {showResults &&
                <div id={RESULTS_ID} role="listbox" className="search-results-container">
                    {books.map((book, index) =>
                        <SearchResultEntry
                            key={book.id}
                            book={book}
                            active={index === activeIndex}
                            onOpen={openBook}
                            onActivate={() => setActiveIndex(index)}
                            onAddToCart={onAddToCart}
                        />
                    )}
                </div>
            }
            {searchError !== undefined &&
                <div className="search-results-container search-error" role="alert">
                    {api.apiErrorMessage(searchError)}
                </div>
            }
        </form>
    );
}
