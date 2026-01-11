// src/services/authService.js

// Días de expiración para la opción "Recuérdame" (configurable)
const REMEMBER_DAYS = 7;

export async function login({ username, password, remember }) {
  // Usuario fijo: Kgranados / SodaGalindo
  const fixedUser = { username: "Kgranados", password: "SodaGalindo" };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Normalizar username (trim + lowercase) para comparar sin sensibilidad a mayúsculas
      const normalized = typeof username === 'string' ? username.trim().toLowerCase() : "";
      const fixedNormalized = fixedUser.username.toLowerCase();

      if (normalized === fixedNormalized && password === fixedUser.password) {
        // Guardar en sessionStorage por defecto; en localStorage si 'remember' es true con expiración
        sessionStorage.setItem("user", JSON.stringify(fixedUser));
        if (remember) {
          const expiresAt = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000;
          localStorage.setItem("user", JSON.stringify({ user: fixedUser, expiresAt }));
        }
        resolve(true);
      } else {
        reject(new Error("Usuario o contraseña incorrectos"));
      }
    }, 500); // simulación de request
  });
}

// Función para verificar si ya está logueado
export function getUser() {
  // Primero revisa sessionStorage (sesión), luego localStorage (recordado con expiración)
  const session = sessionStorage.getItem("user");
  if (session) return JSON.parse(session);

  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    // Forma nueva: { user, expiresAt }
    if (parsed && parsed.expiresAt) {
      if (Date.now() > parsed.expiresAt) {
        // Expirado: limpiar y devolver null
        localStorage.removeItem("user");
        return null;
      }
      return parsed.user || null;
    }
    // Forma antigua (por compatibilidad): objeto usuario directo
    return parsed;
  } catch {
    // Si hay error parseando, limpiar y devolver null
    localStorage.removeItem("user");
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem("user");
  localStorage.removeItem("user");
}
