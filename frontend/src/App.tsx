import { BookPage } from "./book/BookPage.tsx";
import { Cart } from "./cart/Cart.tsx";
import { flyToCart } from "./cart/fly-to-cart.ts";
import { useCart } from "./cart/useCart.ts";
import { HomePage } from "./home/HomePage.tsx";
import { Link, matchBookPath, usePath } from "./router.tsx";
import { Search } from "./search/Search.tsx";

import styles from "./App.module.css";

function App() {
    const cart = useCart();
    const path = usePath();

    const bookId = matchBookPath(path);

    /**
     * @param source Element the user clicked to add the book, where the animation starts from.
     */
    function addToCart(book: { id: string; title: string }, source: HTMLElement) {
        cart.addItem(book);
        flyToCart(source);
    }

    return (
        <div className={styles.page}>
            <header className={styles.siteHeader}>
                <Link to="/" className={styles.logo}>Prostore</Link>
                <Cart items={cart.items} itemCount={cart.itemCount} onRemove={cart.removeItem} />
            </header>

            <Search onAddToCart={addToCart} />

            {bookId !== undefined
                ? <BookPage bookId={bookId} onAddToCart={addToCart} />
                : <HomePage onAddToCart={addToCart} />
            }
        </div>
    )
}

export default App
