// src/services/authService.js

const REMEMBER_DAYS = 7;

// Lista de usuarios fijos con rol
const fixedUsers = [
  { username: "Kgranados", password: "SodaGalindo", taxRate: 1, role: "full" },   // puede acceder a dashboard + calculadora
  { username: "Gjimenez", password: "Carniceria", taxRate: 13, role: "taxOnly" }  // solo calculadora de impuestos
];

export async function login({ username, password, remember }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalized = typeof username === 'string' ? username.trim().toLowerCase() : "";

      // Buscar usuario en la lista
      const user = fixedUsers.find(
        u => u.username.toLowerCase() === normalized && u.password === password
      );

      if (user) {
        // Guardar en sessionStorage o localStorage si 'remember'
        sessionStorage.setItem("user", JSON.stringify(user));
        if (remember) {
          const expiresAt = Date.now() + REMEMBER_DAYS * 24 * 60 * 60 * 1000;
          localStorage.setItem("user", JSON.stringify({ user, expiresAt }));
        }
        resolve(true);
      } else {
        reject(new Error("Usuario o contraseña incorrectos"));
      }
    }, 500);
  });
}

export function getUser() {
  const session = sessionStorage.getItem("user");
  if (session) return JSON.parse(session);

  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.expiresAt) {
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem("user");
        return null;
      }
      return parsed.user || null;
    }
    return parsed;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function logout() {
  sessionStorage.removeItem("user");
  localStorage.removeItem("user");
}
