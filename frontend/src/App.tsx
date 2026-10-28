import './App.css'
import { BookPage } from "./book/BookPage.tsx";
import { Cart } from "./cart/Cart.tsx";
import { useCart } from "./cart/useCart.ts";
import { HomePage } from "./home/HomePage.tsx";
import { Link, matchBookPath, usePath } from "./router.tsx";
import { Search } from "./search/Search.tsx";

function App() {
    const cart = useCart();
    const path = usePath();

    const bookId = matchBookPath(path);

    return (
        <div className="page">
            <header className="site-header">
                <Link to="/" className="logo">Prostore</Link>
                <Cart items={cart.items} itemCount={cart.itemCount} onRemove={cart.removeItem} />
            </header>

            <Search onAddToCart={cart.addItem} />

            {bookId !== undefined
                ? <BookPage bookId={bookId} onAddToCart={cart.addItem} />
                : <HomePage onAddToCart={cart.addItem} />
            }
        </div>
    )
}

export default App
