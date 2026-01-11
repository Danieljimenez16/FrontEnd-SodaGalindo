import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import TaxCalculator from "./Components/CalcularImpuesto";
import { getUser } from "./services/authService";
import ProtectedRoute from "./Components/ProtectedRoute"; // componente que controla acceso por rol

function App() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getUser()));
  const user = getUser(); // usuario autenticado actual

  if (!loggedIn) {
    return <Login onLoginSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <Routes>
      {/* Redirige la raíz según rol */}
      <Route
        path="/"
        element={
          <Navigate
            to={user?.role === "taxOnly" ? "/tax" : "/dashboard"}
            replace
          />
        }
      />

      {/* Dashboard solo para usuarios full */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireRole="full">
            <Dashboard onLogout={() => setLoggedIn(false)} />
          </ProtectedRoute>
        }
      />

      {/* Calculadora de impuestos para todos los usuarios */}
      <Route
        path="/tax"
        element={
          <ProtectedRoute>
            <TaxCalculator taxRate={user?.taxRate || 1} />
          </ProtectedRoute>
        }
      />

      {/* Ruta comodín: redirige según rol */}
      <Route
        path="*"
        element={
          <Navigate
            to={user?.role === "taxOnly" ? "/tax" : "/dashboard"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
