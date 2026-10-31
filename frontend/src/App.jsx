import { API } from "./config/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

// Komponen navigasi dan autentikasi
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";

// Komponen halaman aplikasi
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import MyProductsPage from "./pages/MyProductsPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";



// Key untuk menyimpan token login selama sesi browser
const TOKEN_KEY = "simplestore_token";
const CART_KEY = "simplestore_cart";
// Batas waktu request API: 15 detik
const API_TIMEOUT = 15000;
// Kategori produk dan emoji untuk tampilan
export const PRODUCT_CATEGORIES = {
  audio: {
    label: "Audio",
    emoji: "🎧",
  },
  elektronik: {
    label: "Elektronik",
    emoji: "💻",
  },
  aksesori: {
    label: "Aksesori",
    emoji: "⌚",
  },
  fashion: {
    label: "Fashion",
    emoji: "👕",
  },
  lainnya: {
    label: "Produk Lainnya",
    emoji: "📦",
  },
};
// Membaca respons JSON dan menangani respons API yang gagal
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

// Menghentikan request jika API terlalu lama merespons
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    API_TIMEOUT
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request terlalu lama. Periksa apakah service backend masih berjalan."
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// Mendukung beberapa bentuk respons daftar dari API Laravel
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.value)) return data.value;

  return [];
}

export default function App() {
  // ========================================
  // STATE UTAMA APLIKASI
  // ========================================

  // Daftar produk yang ditampilkan di halaman utama
  const [products, setProducts] = useState([]);
  const [apiStatus, setApiStatus] = useState("loading");

  // Isi keranjang berdasarkan ID produk
  // Membaca keranjang dari localStorage ketika aplikasi dibuka
const [cart, setCart] = useState(() => {
  try {
    const savedCart = localStorage.getItem(CART_KEY);

    if (!savedCart) return {};

    const parsedCart = JSON.parse(savedCart);

    // Memastikan data yang tersimpan berbentuk objek
    if (
      parsedCart &&
      typeof parsedCart === "object" &&
      !Array.isArray(parsedCart)
    ) {
      return parsedCart;
    }

    return {};
  } catch (error) {
    console.error("Gagal membaca keranjang:", error);
    return {};
  }
});

// Menyimpan keranjang setiap kali isinya berubah
useEffect(() => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Gagal menyimpan keranjang:", error);
  }
}, [cart]);

  // Halaman aktif aplikasi
  const [page, setPage] = useState("home");

  // Notifikasi aplikasi
  const [notice, setNotice] = useState("");

  // Membaca token pengguna dari sesi browser
  const [token, setToken] = useState(
    () => sessionStorage.getItem(TOKEN_KEY) || ""
  );

  // Status modal login dan registrasi
  const [authMode, setAuthMode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Data riwayat pesanan pembeli
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Status proses checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Menghitung jumlah seluruh barang dalam keranjang
  const cartCount = useMemo(
    () =>
      Object.values(cart).reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cart]
  );

  // Menampilkan notifikasi selama 3,5 detik
  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice((current) =>
        current === message ? "" : current
      );
    }, 3500);
  }, []);

  // ========================================
  // MEMUAT KATALOG PRODUK
  // ========================================

  // Katalog tetap dapat dilihat oleh pengunjung tanpa login
  const loadProducts = useCallback(async () => {
  setApiStatus("loading");

  try {
    const response = await fetchWithTimeout(
      	`${API.products}/products`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await readResponse(response);
    const list = extractList(data);

    // Kategori diambil langsung dari database Product Service
    setProducts(
      list.map((product) => ({
        ...product,
        category: PRODUCT_CATEGORIES[product.category]
          ? product.category
          : "lainnya",
      }))
    );

    setApiStatus("success");
  } catch (error) {
    console.error("Gagal memuat produk:", error);
    setApiStatus("error");

    showNotice(`Produk gagal dimuat: ${error.message}`);
  }
}, [showNotice]);

  // Memuat katalog ketika aplikasi pertama kali dibuka
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ========================================
  // RIWAYAT PESANAN PEMBELI
  // ========================================

  // Mengambil pesanan milik pengguna yang sedang login
  const loadTransactions = useCallback(async () => {
    if (!token) {
      setHistoryError("Silakan login untuk melihat pesanan.");
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetchWithTimeout(
        `${API.transactions}/transactions`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      // Memperbarui riwayat hanya setelah API berhasil
      setTransactions(extractList(data));
    } catch (error) {
      console.error("Gagal memuat riwayat transaksi:", error);

      // Mempertahankan data sebelumnya jika API bermasalah
      setHistoryError(
        error.message || "Gagal memuat riwayat transaksi."
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  // Memuat riwayat saat halaman Pesanan Saya dibuka
  useEffect(() => {
    if (page === "orders" && token) {
      loadTransactions();
    }
  }, [page, token, loadTransactions]);

  // ========================================
  // LOGIN
  // ========================================

  // Melakukan login melalui User Service
  async function handleLogin(credentials) {
    setAuthLoading(true);

    try {
      const response = await fetchWithTimeout(
        `${API.users}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await readResponse(response);

      if (!data.access_token) {
        throw new Error("Token login tidak ditemukan.");
      }

      // Menyimpan token untuk sesi browser saat ini
      sessionStorage.setItem(TOKEN_KEY, data.access_token);
      setToken(data.access_token);
      setAuthMode("");

      // Mengosongkan riwayat akun sebelumnya
      setTransactions([]);
      setHistoryError("");

      showNotice("Login berhasil. Selamat berbelanja!");
    } catch (error) {
      showNotice(`Login gagal: ${error.message}`);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  // ========================================
  // REGISTRASI
  // ========================================

  // Membuat akun baru melalui User Service
  async function handleRegister(details) {
    setAuthLoading(true);

    try {
      const response = await fetchWithTimeout(
        `${API.users}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(details),
        }
      );

      await readResponse(response);

      // Setelah mendaftar, pengguna diminta login
      setAuthMode("login");
      showNotice("Pendaftaran berhasil. Silakan login.");
    } catch (error) {
      showNotice(`Pendaftaran gagal: ${error.message}`);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  // ========================================
  // LOGOUT
  // ========================================

  // Mengakhiri sesi pengguna
  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);

    setToken("");
    setTransactions([]);
    setHistoryError("");
    setHistoryLoading(false);
    setPage("home");
    setAuthMode("");

    // Keranjang dikosongkan ketika pengguna logout
    setCart({});

    showNotice("Kamu sudah logout.");
  }

  // ========================================
  // KERANJANG
  // ========================================

  // Menambahkan produk hanya jika pengguna sudah login
  function addToCart(product) {
    // PENTING: pengunjung yang belum login tidak dapat
    // memasukkan produk ke keranjang.
    if (!token) {
      showNotice("Silakan login terlebih dahulu untuk berbelanja.");
      setAuthMode("login");
      return;
    }

    // Memastikan produk masih memiliki stok
    const stock = Number(product.stock) || 0;

    if (stock < 1) {
      showNotice("Stok produk sedang habis.");
      return;
    }

    // Menambahkan satu barang dengan validasi stok
    setCart((current) => {
      const existing = current[product.id];
      const nextQuantity = (existing?.quantity || 0) + 1;

      if (nextQuantity > stock) {
        showNotice("Jumlah melebihi stok yang tersedia.");
        return current;
      }

      return {
        ...current,
        [product.id]: {
          ...product,
          quantity: nextQuantity,
        },
      };
    });

    showNotice(`${product.name} ditambahkan ke keranjang.`);
  }

  // Mengubah jumlah barang dalam keranjang
  function changeQuantity(productId, quantity) {
    // Pengguna harus login untuk mengubah keranjang
    if (!token) {
      setAuthMode("login");
      showNotice("Silakan login terlebih dahulu.");
      return;
    }

    const item = cart[productId];

    if (!item) return;

    const nextQuantity = Number(quantity);

    // Jumlah harus bilangan bulat dan tidak melebihi stok
    if (
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 1 ||
      nextQuantity > Number(item.stock)
    ) {
      return;
    }

    setCart((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        quantity: nextQuantity,
      },
    }));
  }

  // Menghapus produk dari keranjang
  function removeFromCart(productId) {
    if (!token) {
      setAuthMode("login");
      showNotice("Silakan login terlebih dahulu.");
      return;
    }

    setCart((current) => {
      const updated = { ...current };
      delete updated[productId];
      return updated;
    });

    showNotice("Produk dihapus dari keranjang.");
  }

  // ========================================
  // CHECKOUT
  // ========================================

  // Membuat transaksi menggunakan metode pembayaran COD
  async function handleCheckout(options = {}) {
    // Checkout hanya diperbolehkan bagi pengguna login
    if (!token) {
      setAuthMode("login");
      showNotice("Silakan login untuk melanjutkan checkout.");
      return;
    }

    const items = Object.values(cart);

    if (items.length === 0) {
      showNotice("Keranjang masih kosong.");
      return;
    }

    const fulfillmentMethod =
      options.fulfillment_method || "delivery";

    const paymentMethod = "cod";

    setCheckoutLoading(true);

    const completedIds = [];
    const failedItems = [];

    try {
      // Membuat transaksi untuk setiap produk
      for (const item of items) {
        try {
          const response = await fetchWithTimeout(
            `${API.transactions}/transactions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                product_id: item.id,
                quantity: item.quantity,
                fulfillment_method: fulfillmentMethod,
                payment_method: paymentMethod,
              }),
            }
          );

          await readResponse(response);
          completedIds.push(item.id);
        } catch (error) {
          failedItems.push({
            name: item.name,
            message: error.message,
          });
        }
      }

      // Hanya barang yang berhasil dipesan yang dihapus
      if (completedIds.length > 0) {
        setCart((current) => {
          const updated = { ...current };

          completedIds.forEach((id) => {
            delete updated[id];
          });

          return updated;
        });

        // Memuat ulang katalog setelah transaksi berhasil
        await loadProducts();
      }

      if (failedItems.length === 0) {
        showNotice("Checkout berhasil! Pesananmu sudah dibuat.");
        setPage("orders");

        // Memuat riwayat terbaru setelah checkout
        await loadTransactions();
      } else if (completedIds.length > 0) {
        showNotice(
          `${completedIds.length} item berhasil dipesan. ` +
            `${failedItems.length} item gagal; periksa keranjangmu.`
        );
      } else {
        showNotice(`Checkout gagal: ${failedItems[0].message}`);
      }
    } finally {
      setCheckoutLoading(false);
    }
  }

  // ========================================
  // TAMPILAN APLIKASI
  // ========================================

  return (
    <div className="app-shell">
      {/* Navigasi utama */}
      <Navbar
        page={page}
        setPage={setPage}
        cartCount={cartCount}
        token={token}
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
        onLogout={handleLogout}
      />

      {/* Halaman utama dan katalog produk */}
      {page === "home" && (
        <HomePage
          products={products}
          apiStatus={apiStatus}
          onAdd={addToCart}
          onBrowseCart={() => {
            // Pengunjung tanpa login diminta login
            if (!token) {
              setAuthMode("login");
              showNotice("Login terlebih dahulu untuk membuka keranjang.");
              return;
            }

            setPage("cart");
          }}
          onRegister={() => setAuthMode("register")}
          isLoggedIn={Boolean(token)}
        />
      )}

      {/* Halaman keranjang hanya dapat dibuka saat login */}
      {page === "cart" &&
        (token ? (
          <CartPage
            cart={cart}
            onChangeQuantity={changeQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
            checkoutLoading={checkoutLoading}
            token={token}
            onLogin={() => setAuthMode("login")}
            notice={notice}
          />
        ) : (
          <main className="seller-login-required">
            <h2>Login untuk membuka keranjang</h2>
            <p>
              Masuk ke akunmu terlebih dahulu untuk berbelanja.
            </p>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
          </main>
        ))}

      {/* Riwayat pesanan pembeli */}
      {page === "orders" &&
        (token ? (
          <OrderHistoryPage
            transactions={transactions}
            loading={historyLoading}
            error={historyError}
            onRefresh={loadTransactions}
            onBrowseProducts={() => setPage("home")}
            token={token}
            onNotice={showNotice}
          />
        ) : (
          <main className="seller-login-required">
            <h2>Login untuk melihat pesanan</h2>
            <p>Masuk untuk melihat riwayat transaksi milikmu.</p>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
          </main>
        ))}

      {/* Halaman pengelolaan produk penjual */}
      {page === "sell" &&
        (token ? (
          <MyProductsPage
            token={token}
            onNotice={showNotice}
            onProductsChanged={loadProducts}
          />
        ) : (
          <main className="seller-login-required">
            <h2>Login untuk mulai berjualan</h2>
            <p>Masuk atau daftar akun untuk menambahkan produk.</p>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("register")}
            >
              Daftar
            </button>
          </main>
        ))}

      {/* Pesanan masuk milik penjual */}
      {page === "sellerOrders" &&
        (token ? (
          <SellerOrdersPage
            token={token}
            onNotice={showNotice}
          />
        ) : (
          <main className="seller-login-required">
            <h2>Login untuk melihat pesanan masuk</h2>
            <p>Masuk ke akun penjual untuk mengelola pesanan.</p>

            <button
              type="button"
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
          </main>
        ))}

      {/* Modal login dan registrasi */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode("")}
          onSwitchMode={setAuthMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={authLoading}
        />
      )}

      {/* Notifikasi sukses atau gagal */}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}
