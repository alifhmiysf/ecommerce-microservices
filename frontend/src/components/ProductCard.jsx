
import { formatPrice } from "../utils/formatters";

const CATEGORY_META = {
  audio: {
    label: "Audio",
    emoji: "🎧",
    color: "audio",
  },
  elektronik: {
    label: "Elektronik",
    emoji: "💻",
    color: "elektronik",
  },
  aksesori: {
    label: "Aksesori",
    emoji: "⌚",
    color: "aksesori",
  },
  fashion: {
    label: "Fashion",
    emoji: "👟",
    color: "fashion",
  },
  lainnya: {
    label: "Produk Lainnya",
    emoji: "📦",
    color: "lainnya",
  },
};

export default function ProductCard({ product, onAdd }) {
  const categoryKey = String(product.category || "lainnya")
    .trim()
    .toLowerCase();

  const category =
    CATEGORY_META[categoryKey] || CATEGORY_META.lainnya;

  const stock = Number(product.stock) || 0;

  return (
    <article className="product-card">
      <div className={`product-visual ${category.color}`}>
        <span className="product-emoji">{category.emoji}</span>
      </div>

      <div className="product-info">
        <span className="product-category">{category.label}</span>
        <h3>{product.name}</h3>

        <div className="product-bottom">
          <div>
            <strong>{formatPrice(product.price)}</strong>
            <small>
              {stock > 0 ? `Stok: ${stock}` : "Stok habis"}
            </small>
          </div>

          <button
            type="button"
            className="add-button"
            title="Tambah ke keranjang"
            aria-label={`Tambah ${product.name} ke keranjang`}
            disabled={stock <= 0}
            onClick={() => onAdd(product)}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
