import {useEffect, useState, type InputEvent } from 'react';
import './App.css'
import * as api from "./api.ts";
import type { EndpointResponseAwaited } from "./api.ts";

function SearchResultEntry({ title }: { title: string; }) {
  return <p>{title}</p>;
}

type Book = EndpointResponseAwaited<'getBooks'>[number];

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.length <= 1) {
      setBooks([]);
      return;
    }

    api.getBooks(searchQuery).then(books => {
      setBooks(books);
    });
  }, [searchQuery]);

  return (
    <div className="page">
      <header className="site-header">
        <span className="logo">Prostore</span>
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
                <SearchResultEntry key={book.isbn} title={book.title}/>
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
