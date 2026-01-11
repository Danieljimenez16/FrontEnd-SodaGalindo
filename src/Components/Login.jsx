import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalizar username (ignorar mayúsculas y espacios)
    const normalizedUsername = form.username ? form.username.trim().toLowerCase() : "";

    // Validación mínima
    if (!normalizedUsername) {
      setError("El usuario es requerido");
      return;
    }
    if (!form.password || form.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setError("");
    setLoading(true);
    try {
      // Enviar payload con username normalizado, sin mutar el input mostrado
      const payload = { ...form, username: normalizedUsername };
      await login(payload);
      // Mostrar mensaje de éxito en la UI y redirigir tras breve espera
      setShowSuccess(true);
      setLoading(false);
      if (onLoginSuccess) onLoginSuccess();
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Accede a tu cuenta para gestionar tus finanzas</p>

        {showSuccess && (
          <div className={`success-message ${showSuccess ? 'show' : ''}`} role="status" aria-live="polite">
            <div className="success-icon">✓</div>
            <h3>¡Perfecto!</h3>
            <p>Los datos ingresados son correctos. Redirigiendo al Dashboard…</p>
          </div>
        )}

        {!showSuccess && (
        <form onSubmit={handleSubmit} aria-label="Formulario de inicio de sesión">
          
          <div className={`form-group ${error ? 'error' : ''}`}>
            <div className={`input-wrapper ${form.username ? 'filled' : ''}`}>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder=" "
                disabled={loading}
              />
              <label htmlFor="username">Usuario</label>
              <span className="focus-border" />
            </div>
          </div>

          <div className={`form-group ${error ? 'error' : ''}`}>
            <div className={`input-wrapper password-wrapper ${form.password ? 'filled' : ''}`}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder=" "
                disabled={loading}
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={loading}
              >
                <span className={`eye-icon ${showPassword ? 'show-password' : ''}`} />
              </button>
              <span className="focus-border" />
            </div>
          </div>

          <div className="form-options">
            <div className="remember-wrapper">
              <input
                id="remember"
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="remember" className="checkbox-label">
                <span className="checkmark" />Recuérdame
              </label>
            </div>
          </div>

          {error && <div className={`error-message ${error ? 'show' : ''}`} role="alert">{error}</div>}

          <button className={`btn login-btn ${loading ? 'loading' : ''}`} type="submit" aria-busy={loading}>
            <span className="btn-text">{loading ? 'Ingresando...' : 'Iniciar sesión'}</span>
            <span className="btn-loader" aria-hidden="true" />
          </button>

        </form>
        )}
      </div>
    </div>
  );
}

export default Login;
