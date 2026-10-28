
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "../utils/formatters";

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

const statusLabels = {
  pending: "Menunggu konfirmasi",
  processing: "Sedang diproses",
  shipped: "Dalam pengiriman",
  ready_for_pickup: "Siap diambil",
  completed: "Selesai",
  rejected: "Ditolak",
};

export default function SellerOrdersPage({ token, onNotice }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/transactions/api/seller/transactions",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.value)
            ? data.value
            : [];

      setOrders(list);
    } catch (err) {
      setError(err.message || "Gagal memuat pesanan masuk.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateStatus(order, status) {
    setUpdatingId(order.id);
    setError("");

    try {
      const response = await fetch(
        `/transactions/api/transactions/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await readResponse(response);

      await loadOrders();
      onNotice?.(data.message || "Status pesanan berhasil diperbarui.");
    } catch (err) {
      setError(err.message || "Gagal memperbarui status pesanan.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <main className="seller-dashboard seller-orders-page">
      <section className="seller-hero">
        <div className="seller-hero-content">
          <span className="seller-kicker">SELLER CENTER</span>
          <h1>Pesanan masuk.</h1>
          <p>
            Kelola pesanan pembeli, proses barang, dan perbarui status
            pengiriman tokomu.
          </p>
        </div>

        <div className="seller-hero-art" aria-hidden="true">
          <div className="seller-art-circle">
            <span>✦</span>
            <div className="seller-art-box">S</div>
          </div>
        </div>
      </section>

      <section className="seller-order-summary">
        <div>
          <span>Total pesanan</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>Menunggu konfirmasi</span>
          <strong>{pendingCount}</strong>
        </div>
      </section>

      <section className="seller-panel seller-orders-panel">
        <div className="seller-panel-heading seller-orders-heading">
          <div>
            <span className="seller-section-label">MANAJEMEN TRANSAKSI</span>
            <h2>Daftar pesanan</h2>
            <p>Pesanan yang ditujukan ke akun penjual ini.</p>
          </div>

          <button
            type="button"
            className="seller-refresh-button"
            onClick={loadOrders}
            disabled={loading}
          >
            ↻ Muat ulang
          </button>
        </div>

        <div className="seller-order-filters">
          {[
            ["all", "Semua"],
            ["pending", "Menunggu"],
            ["processing", "Diproses"],
            ["shipped", "Dikirim"],
            ["ready_for_pickup", "Siap diambil"],
            ["completed", "Selesai"],
            ["rejected", "Ditolak"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="seller-error seller-orders-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="seller-state">
            <span className="seller-loader" />
            <p>Memuat pesanan masuk...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="seller-state">
            <div className="seller-empty-icon">▤</div>
            <h3>
              {orders.length === 0
                ? "Belum ada pesanan masuk"
                : "Tidak ada pesanan pada status ini"}
            </h3>
            <p>
              {orders.length === 0
                ? "Pesanan pembeli akan muncul di sini jika produk yang dibeli terdaftar atas akun penjual ini."
                : "Coba pilih filter status lainnya."}
            </p>
          </div>
        ) : (
          <div className="seller-order-list">
            {filteredOrders.map((order) => {
              const product =
                order.product ||
                order.product_detail ||
                {};

              const buyer =
                order.buyer ||
                order.user ||
                {};

              const fulfillment = order.fulfillment_method;
              const busy = updatingId === order.id;

              return (
                <article className="seller-order-card" key={order.id}>
                  <div className="seller-order-top">
                    <div>
                      <span className="seller-order-id">
                        PESANAN #{order.id}
                      </span>
                      <h3>{product.name || `Produk #${order.product_id}`}</h3>
                    </div>

                    <span
                      className={`seller-order-status status-${order.status}`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="seller-order-details">
                    <div>
                      <span>Pembeli</span>
                      <strong>
                        {buyer.name || order.buyer_name || `User #${order.user_id}`}
                      </strong>
                    </div>

                    <div>
                      <span>Jumlah</span>
                      <strong>{order.quantity} item</strong>
                    </div>

                    <div>
                      <span>Total transaksi</span>
                      <strong>
                        {formatPrice(Number(order.total_price || 0))}
                      </strong>
                    </div>

                    <div>
                      <span>Metode penerimaan</span>
                      <strong>
                        {fulfillment === "pickup"
                          ? "Ambil di tempat"
                          : "Pengiriman"}
                      </strong>
                    </div>

                    <div>
                      <span>Pembayaran</span>
                      <strong>Cash on Delivery (COD)</strong>
                    </div>
                  </div>

                  <div className="seller-order-footer">
                    <span>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("id-ID")
                        : "Tanggal tidak tersedia"}
                    </span>

                    <div className="seller-order-actions">
                      {order.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="seller-order-primary"
                            disabled={busy}
                            onClick={() => updateStatus(order, "processing")}
                          >
                            {busy ? "Memproses..." : "Terima pesanan"}
                          </button>

                          <button
                            type="button"
                            className="seller-order-reject"
                            disabled={busy}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Yakin ingin menolak pesanan ini?"
                                )
                              ) {
                                updateStatus(order, "rejected");
                              }
                            }}
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {order.status === "processing" && (
                        <button
                          type="button"
                          className="seller-order-primary"
                          disabled={busy}
                          onClick={() =>
                            updateStatus(
                              order,
                              fulfillment === "pickup"
                                ? "ready_for_pickup"
                                : "shipped"
                            )
                          }
                        >
                          {busy
                            ? "Memperbarui..."
                            : fulfillment === "pickup"
                              ? "Tandai siap diambil"
                              : "Tandai telah dikirim"}
                        </button>
                      )}

                      {order.status === "shipped" && (
                        <span className="seller-order-hint">
                          Menunggu pembeli mengonfirmasi barang diterima.
                        </span>
                      )}

                      {order.status === "ready_for_pickup" && (
                        <span className="seller-order-hint">
                          Menunggu pembeli menyelesaikan pengambilan.
                        </span>
                      )}

                      {order.status === "completed" && (
                        <span className="seller-order-completed">
                          ✓ Transaksi selesai
                        </span>
                      )}

                      {order.status === "rejected" && (
                        <span className="seller-order-hint">
                          Pesanan ditolak.
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
