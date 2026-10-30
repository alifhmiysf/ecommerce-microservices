import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";

const categories = [
  "Semua",
  "Audio",
  "Elektronik",
  "Aksesori",
  "Fashion",
  "Produk",
];

export default function HomePage({
  products,
  apiStatus,
  onAdd,
  onBrowseCart,
  onRegister,
  isLoggedIn,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const meta = String(product.category || "").toLowerCase();
      const query = search.toLowerCase();

      const matchesSearch =
        name.includes(query) || meta.includes(query);

      const matchesCategory =
        category === "Semua" ||
        product.category === category ||
        (category === "Produk" && !categories.includes(product.category));

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            BELANJA LEBIH MUDAH
          </span>

          <h1>
            Temukan produk
            <br />
            favoritmu <span>di sini.</span>
          </h1>

          <p>
            Pilihan produk menarik untuk menemani aktivitasmu.
            Temukan yang kamu butuhkan dan pesan dengan mudah melalui
            SimpleStore.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Jelajahi Produk <span>→</span>
          </button>

          <div className="hero-proof">
            <div className="proof-avatars">
              <span>🛍️</span>
              <span>📦</span>
              <span>✨</span>
            </div>
            <div>
              <strong>Belanja praktis, semua dalam satu tempat</strong>
              <br />
              Pilih produk dan pantau pesananmu.
            </div>
          </div>
        </div>

        <div className="hero-art" aria-label="Ilustrasi produk">
          <div className="art-orbit" />
          <div className="art-orbit orbit-two" />
          <div className="hero-product product-one">🎧</div>
          <div className="hero-product product-two">🎒</div>
          <div className="hero-product product-three">⌚</div>
          <div className="floating-label label-top">✨ Produk pilihan</div>
          <div className="floating-label label-bottom">🛒 Belanja mudah</div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <span className="benefit-icon">📦</span>
          <span>
            <strong>Produk Beragam</strong>
            <small>Pilihan untuk kebutuhanmu</small>
          </span>
        </div>

        <div>
          <span className="benefit-icon">🔒</span>
          <span>
            <strong>Akun Personal</strong>
            <small>Riwayat pesanan tersimpan</small>
          </span>
        </div>

        <div>
          <span className="benefit-icon">⚡</span>
          <span>
            <strong>Proses Praktis</strong>
            <small>Pesan dengan beberapa klik</small>
          </span>
        </div>
      </section>

      <section className="catalog" id="products">
        <div className="section-heading">
          <div>
            <span className="section-kicker">KOLEKSI KAMI</span>
            <h2>
              Jelajahi <span>Produk.</span>
            </h2>
            <p>
              Pilih produk favoritmu dari katalog SimpleStore.
            </p>
          </div>

          <label className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Cari produk..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>
        </div>

        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`category-chip ${category === item ? "selected" : ""}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {apiStatus === "loading" ? (
          <div className="empty-state">
            <span>⏳</span>
            <h3>Memuat produk...</h3>
            <p>Sedang mengambil katalog dari server.</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={onAdd}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span>🔎</span>
            <h3>Produk tidak ditemukan</h3>
            <p>Coba kata kunci atau kategori lainnya.</p>
          </div>
        )}
      </section>

      {!isLoggedIn && (
        <section className="newsletter">
          <div>
            <span className="section-kicker">MULAI SEKARANG</span>
            <h2>Siap menemukan favoritmu?</h2>
            <p>
              Buat akun agar kamu dapat melihat riwayat pesananmu.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={onRegister}
          >
            Buat Akun <span>→</span>
          </button>
        </section>
      )}

      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-icon">S</span>
          <span>
            Simple<span className="brand-accent">Store</span>
          </span>
        </a>
        <p>© {new Date().getFullYear()} SimpleStore. Proyek pembelajaran.</p>
        <p>Belanja lebih mudah, setiap hari.</p>
      </footer>
    </>
  );
}
