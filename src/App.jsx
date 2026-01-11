import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import TaxCalculator from "./Components/CalcularImpuesto";
import TaxPair from "./Components/ImpuestosPar"; // <-- importamos el wrapper de Gjimenez
import { getUser } from "./services/authService";
import ProtectedRoute from "./Components/ProtectedRoute";

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

      {/* Calculadora de impuestos */}
      <Route
        path="/tax"
        element={
          <ProtectedRoute>
            {user?.role === "taxOnly" ? (
              <TaxPair /> // dos calculadoras para Gjimenez
            ) : (
              <TaxCalculator taxRate={user?.taxRate || 1} /> // calculadora normal
            )}
          </ProtectedRoute>
        }
      />

      {/* Ruta comodín */}
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
