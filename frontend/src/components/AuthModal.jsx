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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const passwordsMatch =
    passwordConfirmation.length > 0 &&
    password === passwordConfirmation;

  const passwordsDoNotMatch =
    passwordConfirmation.length > 0 &&
    password !== passwordConfirmation;

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

  const isRegisterInvalid =
    mode === "register" &&
    (
      !password ||
      !passwordConfirmation ||
      password !== passwordConfirmation ||
      password.length < 8
    );

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

          <div className="password-input-wrapper">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {mode === "register" && (
            <>
              <label htmlFor="auth-confirm-password">
                Konfirmasi password
              </label>

              <div className="password-input-wrapper">
                <input
                  id="auth-confirm-password"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  required
                  minLength={8}
                  placeholder="Ulangi password"
                  aria-invalid={passwordsDoNotMatch}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmation((current) => !current)
                  }
                  aria-label={
                    showConfirmation
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                  title={
                    showConfirmation
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showConfirmation ? "🙈" : "👁"}
                </button>
              </div>

              {passwordsMatch && (
                <p className="password-match success">
                  ✓ Password cocok
                </p>
              )}

              {passwordsDoNotMatch && (
                <p className="password-match error">
                  ✕ Password tidak cocok
                </p>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading || isRegisterInvalid}
          >
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
