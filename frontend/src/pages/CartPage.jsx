
import { useState } from "react";
import { formatPrice } from "../utils/formatters";
import { getProductMeta } from "../data/productMeta";

export default function CartPage({
  cart,
  onChangeQuantity,
  onRemove,
  onCheckout,
  checkoutLoading,
  token,
  onLogin,
  notice,
}) {
  const items = Object.values(cart);

  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  function handleCheckout() {
    onCheckout({
      fulfillment_method: fulfillmentMethod,
      payment_method: paymentMethod,
    });
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">KERANJANG BELANJA</span>
          <h2>
            Keranjang <span>Belanja.</span>
          </h2>
          <p>Periksa produk dan jumlah sebelum melakukan checkout.</p>
        </div>
      </div>

      {notice && <div className="page-notice">{notice}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <span>🛒</span>
          <h3>Keranjangmu masih kosong</h3>
          <p>Yuk, cari produk yang kamu suka di katalog.</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => {
              const meta = getProductMeta(item.id);

              return (
                <article className="cart-item" key={item.id}>
                  <div className={`cart-item-visual ${meta.color}`}>
                    <span>{meta.emoji}</span>
                  </div>

                  <div className="cart-item-info">
                    <span className="product-category">{meta.category}</span>
                    <h3>{item.name}</h3>
                    <strong>{formatPrice(item.price)}</strong>
                    <small>Stok tersedia: {item.stock}</small>

                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="Kurangi jumlah"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          onChangeQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label="Tambah jumlah"
                        disabled={item.quantity >= item.stock}
                        onClick={() =>
                          onChangeQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <strong>
                      {formatPrice(Number(item.price) * item.quantity)}
                    </strong>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => onRemove(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h3>Ringkasan Pesanan</h3>

            <div className="summary-row">
              <span>Jumlah produk</span>
              <strong>
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            
            {!token && (
              <p className="summary-hint">
                Kamu harus login sebelum melakukan checkout.
              </p>
            )}

            <button
              type="button"
              className="primary-button checkout-button"
              disabled={checkoutLoading || items.length === 0}
              onClick={token ? handleCheckout : onLogin}
            >
              {checkoutLoading
                ? "Memproses pesanan..."
                : token
                  ? "Checkout Sekarang →"
                  : "Login untuk Checkout →"}
            </button>

            <p className="summary-hint">
              Total belum termasuk ongkos kirim. Pembayaran dan pengiriman
              diproses sesuai metode yang dipilih.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
