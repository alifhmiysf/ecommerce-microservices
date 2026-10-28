import { formatPrice } from "../utils/formatters";
import { getProductMeta } from "../data/productMeta";
export default function ProductCard({ product, onAdd }) {
  const meta = getProductMeta(product.id);
  const stock = Number(product.stock) || 0;

  return (
    <article className="product-card">
      <div className={`product-visual ${meta.color}`}>
        {meta.tag && <span className="product-tag">{meta.tag}</span>}

        <span className="product-emoji">{meta.emoji}</span>
      </div>

      <div className="product-info">
        <span className="product-category">{meta.category}</span>

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