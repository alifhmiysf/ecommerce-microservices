
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "../utils/formatters";

const API_PRODUCTS = "http://127.0.0.1:8001/api/products";

const categories = [
  { value: "audio", label: "Audio", emoji: "🎧" },
  { value: "elektronik", label: "Elektronik", emoji: "💻" },
  { value: "aksesori", label: "Aksesori", emoji: "⌚" },
  { value: "fashion", label: "Fashion", emoji: "👕" },
  { value: "lainnya", label: "Produk Lainnya", emoji: "📦" },
];

const initialForm = {
  name: "",
  description: "",
  category: "lainnya",
  price: "",
  stock: "1",
};

function getCategoryEmoji(category) {
  return (
    categories.find((item) => item.value === category)?.emoji || "📦"
  );
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errors = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      errors || data.message || `Permintaan gagal (${response.status}).`
    );
  }

  return data;
}

export default function MyProductsPage({
  token,
  onNotice,
  onProductsChanged,
}) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadMyProducts = useCallback(async () => {
    if (!token) {
      setProducts([]);
      setError("Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_PRODUCTS}/my`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMyProducts();
  }, [loadMyProducts]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        editingId
          ? `${API_PRODUCTS}/${editingId}`
          : API_PRODUCTS,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            category: form.category,
            price: Number(form.price),
            stock: Number(form.stock),
          }),
        }
      );

      const data = await readResponse(response);

      resetForm();
      await loadMyProducts();
      await onProductsChanged?.();

      onNotice?.(data.message || "Produk berhasil disimpan.");
    } catch (err) {
      setError(err.message || "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "lainnya",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
    });

    setError("");

    document
      .getElementById("seller-product-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDelete(product) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus produk "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");

    try {
      const response = await fetch(`${API_PRODUCTS}/${product.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await readResponse(response);

      if (editingId === product.id) {
        resetForm();
      }

      await loadMyProducts();
      await onProductsChanged?.();

      onNotice?.(data.message || "Produk berhasil dihapus.");
    } catch (err) {
      setError(err.message || "Gagal menghapus produk.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  );

  const activeProducts = products.filter(
    (product) => Number(product.stock) > 0
  ).length;

  return (
    <main className="seller-dashboard">
      <section className="seller-hero">
        <div className="seller-hero-content">
          <span className="seller-kicker">SELLER CENTER</span>
          <h1>Kelola produk</h1>
          <p>
            Atur informasi produk, pantau stok, dan kelola inventaris tokomu
            melalui satu halaman.
          </p>

          <a href="#seller-product-form" className="seller-hero-button">
            Tambah produk
          </a>
        </div>

        <div className="seller-hero-art" aria-hidden="true">
          <div className="seller-art-circle">
            <div className="seller-art-box">
              <span>SS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="seller-stats">
        <article className="seller-stat-card">
          <span className="seller-stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
          </span>
          <div>
            <p>Total produk</p>
            <strong>{products.length}</strong>
            <span>Produk terdaftar</span>
          </div>
        </article>

        <article className="seller-stat-card">
          <span className="seller-stat-icon stock-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </span>
          <div>
            <p>Produk tersedia</p>
            <strong>{activeProducts}</strong>
            <span>Memiliki stok</span>
          </div>
        </article>

        <article className="seller-stat-card">
          <span className="seller-stat-icon inventory-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </span>
          <div>
            <p>Total stok</p>
            <strong>{totalStock}</strong>
            <span>Seluruh barang</span>
          </div>
        </article>
      </section>

      <div className="seller-content-grid">
        <section
          className="seller-panel seller-form-panel"
          id="seller-product-form"
        >
          <div className="seller-panel-heading">
            <div>
              <span className="seller-section-label">
                {editingId ? "EDIT PRODUK" : "INFORMASI PRODUK"}
              </span>
              <h2>{editingId ? "Perbarui produk" : "Tambah produk"}</h2>
              <p>
                {editingId
                  ? "Periksa dan perbarui detail produk."
                  : "Lengkapi informasi produk yang akan dijual."}
              </p>
            </div>
          </div>

          <form className="seller-form" onSubmit={handleSubmit}>
            <div className="seller-field">
              <label htmlFor="seller-name">Nama produk</label>
              <input
                id="seller-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={255}
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            <div className="seller-field">
              <label htmlFor="seller-category">Kategori produk</label>
              <select
                id="seller-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.emoji} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="seller-field">
              <label htmlFor="seller-description">Deskripsi produk</label>
              <textarea
                id="seller-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={5000}
                rows={4}
                placeholder="Jelaskan kondisi, spesifikasi, atau detail produk."
              />
              <span className="seller-field-hint">
                Maksimal 5.000 karakter.
              </span>
            </div>

            <div className="seller-fields-row">
              <div className="seller-field">
                <label htmlFor="seller-price">Harga</label>
                <div className="seller-price-input">
                  <span>Rp</span>
                  <input
                    id="seller-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="100000"
                    required
                  />
                </div>
              </div>

              <div className="seller-field">
                <label htmlFor="seller-stock">Stok</label>
                <input
                  id="seller-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="seller-error" role="alert">
                {error}
              </div>
            )}

            <div className="seller-submit-actions">
              <button
                type="submit"
                className="seller-submit"
                disabled={saving}
              >
                {saving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan perubahan"
                    : "Terbitkan produk"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="seller-cancel"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="seller-panel seller-inventory-panel">
          <div className="seller-panel-heading inventory-heading">
            <div>
              <span className="seller-section-label">INVENTARIS TOKO</span>
              <h2>Produk saya</h2>
              <p>Daftar produk yang kamu kelola.</p>
            </div>
            <span className="seller-product-count">{products.length}</span>
          </div>

          {loading ? (
            <div className="seller-state">
              <span className="seller-loader" />
              <p>Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="seller-state">
              <div className="seller-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M8 9h8M8 13h8M8 17h4" />
                </svg>
              </div>
              <h3>Belum ada produk</h3>
              <p>Produk yang kamu tambahkan akan muncul di sini.</p>
              <a href="#seller-product-form">Tambah produk pertama</a>
            </div>
          ) : (
            <div className="seller-inventory-list">
              {products.map((product) => {
                const stock = Number(product.stock) || 0;

                return (
                  <article
                    className="seller-inventory-item"
                    key={product.id}
                  >
                    <div className="seller-product-thumbnail" aria-hidden="true">
                      <span className="product-emoji">
                        {getCategoryEmoji(product.category)}
                      </span>
                    </div>

                    <div className="seller-inventory-info">
                      <h3>{product.name}</h3>
                      <strong>{formatPrice(Number(product.price))}</strong>
                      <span className="seller-category-label">
                        {categories.find(
                          (item) => item.value === product.category
                        )?.label || "Produk Lainnya"}
                      </span>
                      <span
                        className={
                          stock > 0
                            ? "seller-stock-badge"
                            : "seller-stock-badge sold-out"
                        }
                      >
                        {stock > 0 ? `Stok ${stock}` : "Stok habis"}
                      </span>
                    </div>

                    <div className="seller-item-actions">
                      <button
                        type="button"
                        className="seller-edit-button"
                        onClick={() => startEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        title="Edit produk"
                        disabled={deletingId !== null}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="seller-remove-button"
                        onClick={() => handleDelete(product)}
                        aria-label={`Hapus ${product.name}`}
                        title="Hapus produk"
                        disabled={deletingId !== null}
                      >
                        {deletingId === product.id ? "..." : "Hapus"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
