import {useEffect, useState, type InputEvent } from 'react';
import './App.css'
import * as api from "./api.ts";
import type { EndpointResponseAwaited } from "./api.ts";
import { Cart } from "./cart/Cart.tsx";
import { useCart } from "./cart/useCart.ts";

type Book = EndpointResponseAwaited<'getBooks'>[number];

function SearchResultEntry({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book) => void; }) {
    return (
        <div className="search-result-entry">
            <span>{book.title}</span>
            <button type="button" className="add-to-cart-button" onClick={() => onAddToCart(book)}>
                Add to cart
            </button>
        </div>
    );
}

function App() {
    const cart = useCart();

    const [books, setBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function search() {
            setBooks(await api.getBooks(searchQuery));
        }

        if (searchQuery.length <= 1) {
            setBooks([]);
            return;
        }
        search();
    }, [searchQuery]);

    return (
        <div className="page">
            <header className="site-header">
                <span className="logo">Prostore</span>
                <Cart items={cart.items} itemCount={cart.itemCount} onRemove={cart.removeItem} />
            </header>

            <form className="search-bar">
                <div>
                    <input
                        type="search"
                        className="search-input"
                        onInput={(e: InputEvent<HTMLInputElement>) => {
                            return setSearchQuery(e.currentTarget.value);
                        }}
                        placeholder="Search for books, authors, or genres..."
                        value={searchQuery}
                    />
                    <button type="submit" className="search-button">
                        Search
                    </button>
                </div>
                {books.length > 0 &&
                    <div className="search-results-container">
                        {books.map(book =>
                            <SearchResultEntry key={book.isbn} book={book} onAddToCart={cart.addItem}/>
                        )}
                    </div>
                }
            </form>

            <section className="banner">
                <div className="banner-content">
                    <span className="banner-eyebrow">Featured Book</span>
                    <h1 className="banner-title">The Midnight Library</h1>
                    <p className="banner-author">by Matt Haig</p>
                    <p className="banner-description">
                        Between life and death there is a library, and within that
                        library, the shelves go on forever. Every book provides a chance
                        to try another life you could have lived.
                    </p>
                    <div className="banner-actions">
                        <span className="banner-price">$14.99</span>
                        <button type="button" className="banner-cta">
                            View Book
                        </button>
                    </div>
                </div>

                <div className="banner-cover" aria-hidden="true">
                    <div className="cover-spine" />
                    <div className="cover-face">
                        <span className="cover-title">The Midnight Library</span>
                        <span className="cover-author">Matt Haig</span>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default App
