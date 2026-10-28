import { useState } from "react";

export default function AuthModal({
  mode,
  onClose,
  onSwitchMode,
  onLogin,
  onRegister,
  loading,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== passwordConfirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      if (mode === "login") {
        await onLogin({ email, password });
      } else {
        await onRegister({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    }
  }

  return (
    <div
      className="login-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          type="button"
          className="login-close"
          onClick={onClose}
          aria-label="Tutup"
        >
          ×
        </button>

        <span className="section-kicker">SIMPLESTORE ACCOUNT</span>

        <h2 id="auth-title">
          {mode === "login" ? "Selamat datang!" : "Buat akun baru"}
        </h2>

        <p>
          {mode === "login"
            ? "Login untuk melanjutkan belanja dan melihat pesanan."
            : "Daftar untuk mulai berbelanja di SimpleStore."}
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label htmlFor="register-name">Nama lengkap</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={255}
                placeholder="Masukkan nama lengkap"
              />
            </>
          )}

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="nama@email.com"
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
          />

          {mode === "register" && (
            <>
              <label htmlFor="auth-confirm-password">
                Konfirmasi password
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                required
                minLength={8}
                placeholder="Ulangi password"
              />
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Memproses..."
              : mode === "login"
                ? "Login"
                : "Buat Akun"}
          </button>
        </form>

       
<div className="auth-switch">
  {mode === "login" ? (
    <>
      <span>Belum punya akun?</span>
      <button
        type="button"
        onClick={() => onSwitchMode("register")}
      >
        Daftar sekarang
      </button>
    </>
  ) : (
    <>
      <span>Sudah punya akun?</span>
      <button
        type="button"
        onClick={() => onSwitchMode("login")}
      >
        Login
      </button>
    </>
  )}
</div>

      </section>
    </div>
  );
}