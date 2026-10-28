
import { useState } from "react";
import { formatDate, formatPrice } from "../utils/formatters";
import { getProductMeta } from "../data/productMeta";

// Label status transaksi agar mudah dipahami pembeli
const statusLabels = {
  pending: "Menunggu konfirmasi",
  processing: "Sedang diproses",
  shipped: "Sedang dikirim",
  ready_for_pickup: "Siap diambil",
  completed: "Selesai",
  rejected: "Ditolak",
};

// Membaca respons API dan menampilkan pesan error dari backend
async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validationMessage ||
        data.message ||
        `Permintaan gagal (${response.status}).`
    );
  }

  return data;
}

export default function OrderHistoryPage({
  transactions,
  loading,
  error,
  onRefresh,
  onBrowseProducts,
  token,
  onNotice,
}) {
  // Menyimpan ID transaksi yang sedang dikonfirmasi
  const [confirmingId, setConfirmingId] = useState(null);

  // Menyimpan error khusus ketika konfirmasi penerimaan gagal
  const [confirmError, setConfirmError] = useState("");

  // Mengirim konfirmasi penerimaan barang ke Transaction Service
  async function handleConfirmReceived(transaction) {
    const confirmed = window.confirm(
      `Pastikan pesanan #${transaction.id} sudah benar-benar kamu terima. Lanjutkan konfirmasi?`
    );

    if (!confirmed) return;

    setConfirmingId(transaction.id);
    setConfirmError("");

    try {
      // Endpoint ini memverifikasi bahwa transaksi milik pembeli
      const response = await fetch(
        `/transactions/api/transactions/${transaction.id}/confirm-received`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      // Ambil ulang riwayat agar status terbaru tampil di halaman
      await onRefresh();

      onNotice?.(
        data.message || "Pesanan berhasil dikonfirmasi selesai."
      );
    } catch (err) {
      setConfirmError(
        err.message || "Gagal mengonfirmasi penerimaan barang."
      );
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <section className="page-section">
      {/* Judul halaman dan tombol untuk memuat ulang riwayat */}
      <div className="section-heading">
        <div>
          <span className="section-kicker">AKUN SAYA</span>
          <h2>
            Pesanan <span>Saya.</span>
          </h2>
          <p>Lihat transaksi yang pernah kamu lakukan.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Memuat..." : "↻ Muat Ulang"}
        </button>
      </div>

      {/* Menampilkan error ketika riwayat transaksi gagal dimuat */}
      {error && <div className="form-error history-error">{error}</div>}

      {/* Menampilkan error ketika konfirmasi penerimaan gagal */}
      {confirmError && (
        <div className="form-error history-error">{confirmError}</div>
      )}

      {loading ? (
        // Tampilan saat data transaksi sedang dimuat
        <div className="empty-state">
          <span>⏳</span>
          <h3>Memuat riwayat pesanan...</h3>
        </div>
      ) : transactions.length === 0 ? (
        // Tampilan ketika pembeli belum mempunyai transaksi
        <div className="empty-state">
          <span>📦</span>
          <h3>Belum ada transaksi</h3>
          <p>Pesanan yang berhasil dibuat akan tampil di halaman ini.</p>

          <button
            type="button"
            className="primary-button"
            onClick={onBrowseProducts}
          >
            Cari Produk <span>→</span>
          </button>
        </div>
      ) : (
        // Daftar seluruh transaksi milik pembeli
        <div className="history-list">
          {transactions.map((transaction) => {
            const meta = getProductMeta(transaction.product_id);

            // Status transaksi digunakan untuk menentukan tombol aksi
            const status = String(
              transaction.status || "pending"
            ).toLowerCase();

            // Konfirmasi tersedia setelah barang dikirim atau siap diambil
            const canConfirm = [
              "shipped",
              "ready_for_pickup",
            ].includes(status);

            // Mencegah tombol transaksi yang sedang diproses diklik berulang
            const isConfirming = confirmingId === transaction.id;

            return (
              <article className="history-card" key={transaction.id}>
                {/* Ikon kategori produk */}
                <div className={`history-product-icon ${meta.color}`}>
                  {meta.emoji}
                </div>

                {/* Informasi utama transaksi */}
                <div className="history-main">
                  <div className="history-title-row">
                    <h3>Pesanan #{transaction.id}</h3>

                    {/* Status internal diterjemahkan menjadi label Indonesia */}
                    <span
                      className={`status-pill status-${status}`}
                    >
                      {statusLabels[status] || status}
                    </span>
                  </div>

                  <p>Produk ID: {transaction.product_id}</p>
                  <p>Jumlah: {transaction.quantity}</p>

                  <small>
                    {formatDate(
                      transaction.created_at || transaction.createdAt
                    )}
                  </small>

                  {/* Tombol konfirmasi hanya muncul pada status yang sesuai */}
                  {canConfirm && (
                    <div className="history-confirm-action">
                      <p>
                        {status === "shipped"
                          ? "Barang sudah kamu terima? Konfirmasikan setelah memeriksa pesanan."
                          : "Sudah mengambil pesanan? Konfirmasikan setelah barang diterima."}
                      </p>

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleConfirmReceived(transaction)}
                        disabled={isConfirming || !token}
                      >
                        {isConfirming
                          ? "Mengonfirmasi..."
                          : "✓ Konfirmasi Barang Diterima"}
                      </button>
                    </div>
                  )}

                  {/* Keterangan ketika transaksi telah selesai */}
                  {status === "completed" && (
                    <p className="history-completed-message">
                      ✓ Pesanan telah selesai. Terima kasih sudah berbelanja!
                    </p>
                  )}

                  {/* Keterangan ketika pesanan ditolak */}
                  {status === "rejected" && (
                    <p className="history-rejected-message">
                      Pesanan ini ditolak oleh penjual.
                    </p>
                  )}
                </div>

                {/* Total harga transaksi */}
                <div className="history-total">
                  <small>Total transaksi</small>
                  <strong>{formatPrice(transaction.total_price)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
