
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
    event?.preventDefault();
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

  function handleCart() {
    setMenuOpen(false);

    if (!token) {
      onLogin();
      return;
    }

    navigate("cart");
  }

  function renderCartButton() {
    return (
      <button
        type="button"
        className="cart-button"
        onClick={handleCart}
        aria-label={`Keranjang, ${cartCount} barang`}
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
    <>
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

        {/* Keranjang khusus header mobile */}
        <button
          type="button"
          className="mobile-cart-button"
          onClick={handleCart}
          aria-label={`Buka keranjang, ${cartCount} barang`}
        >
          🛒
          <span className="mobile-cart-count">{cartCount}</span>
        </button>

        {/* Hamburger */}
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

        {/* Navigasi utama */}
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

        {/* Navigasi desktop */}
        <div className="nav-actions">
          {token && renderCartButton()}
          {renderAuthActions()}
        </div>
      </header>

      {/* Navigasi bawah mobile */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi mobile">
        <button
          type="button"
          className={
            page === "home"
              ? "bottom-nav-item active"
              : "bottom-nav-item"
          }
          onClick={() => navigate("home")}
        >
          <span className="bottom-nav-icon">⌂</span>
          <span>Beranda</span>
        </button>

        <button
          type="button"
          className="bottom-nav-item"
          onClick={navigateToProducts}
        >
          <span className="bottom-nav-icon">⌕</span>
          <span>Cari</span>
        </button>

        <button
          type="button"
          className={
            page === "cart"
              ? "bottom-nav-item active"
              : "bottom-nav-item"
          }
          onClick={handleCart}
        >
          <span className="bottom-nav-icon bottom-cart-icon">
            🛒
            {cartCount > 0 && (
              <span className="bottom-cart-count">{cartCount}</span>
            )}
          </span>
          <span>Keranjang</span>
        </button>

        <button
          type="button"
          className="bottom-nav-item"
          onClick={token ? handleLogout : handleLogin}
        >
          <span className="bottom-nav-icon">⇥</span>
          <span>{token ? "Keluar" : "Login"}</span>
        </button>
      </nav>
    </>
  );
}
