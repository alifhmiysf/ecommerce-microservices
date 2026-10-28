
import { useState } from "react";

export default function Navbar({
  page,
  setPage,
  cartCount,
  token,
  onLogin,
  onRegister,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(nextPage) {
    setPage(nextPage);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateToProducts(event) {
    event.preventDefault();
    navigate("home");

    window.setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleLogin() {
    setMenuOpen(false);
    onLogin();
  }

  function handleRegister() {
    setMenuOpen(false);
    onRegister();
  }

  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  function renderCartButton() {
    return (
      <button
        type="button"
        className="cart-button"
        onClick={() => navigate("cart")}
      >
        <span>🛒</span>
        <span>Keranjang</span>
        <span className="cart-count">{cartCount}</span>
      </button>
    );
  }

  function renderAuthActions() {
    if (token) {
      return (
        <button
          type="button"
          className="auth-nav-button"
          onClick={handleLogout}
        >
          Keluar
        </button>
      );
    }

    return (
      <div className="auth-nav-actions">
        <button
          type="button"
          className="auth-nav-button"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          type="button"
          className="auth-nav-button auth-nav-primary"
          onClick={handleRegister}
        >
          Daftar
        </button>
      </div>
    );
  }

  return (
    <header className="navbar">
      <a
        href="#home"
        className="brand"
        onClick={(event) => {
          event.preventDefault();
          navigate("home");
        }}
      >
        <span className="brand-icon">S</span>
        <span>
          Simple<span className="brand-accent">Store</span>
        </span>
      </a>

      <button
        type="button"
        className="mobile-menu-button"
        aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>{menuOpen ? "✕" : "☰"}</span>
      </button>

      <nav
        id="main-navigation"
        className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
      >
        <a
          href="#home"
          className={page === "home" ? "active" : ""}
          onClick={(event) => {
            event.preventDefault();
            navigate("home");
          }}
        >
          Beranda
        </a>

        <a href="#products" onClick={navigateToProducts}>
          Produk
        </a>

        {token && (
          <>
            <a
              href="#orders"
              className={page === "orders" ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                navigate("orders");
              }}
            >
              Pesanan Saya
            </a>

            <a
              href="#sell"
              className={page === "sell" ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                navigate("sell");
              }}
            >
              Jual Produk
            </a>

            <a
              href="#seller-orders"
              className={page === "sellerOrders" ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                navigate("sellerOrders");
              }}
            >
              Pesanan Masuk
            </a>
          </>
        )}

        <div className="mobile-nav-actions">
          {token && renderCartButton()}
          {renderAuthActions()}
        </div>
      </nav>

      <div className="nav-actions">
        {token && renderCartButton()}
        {renderAuthActions()}
      </div>
    </header>
  );
}
