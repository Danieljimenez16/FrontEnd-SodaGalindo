// App.jsx
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import TaxCalculator from "./Components/CalcularImpuesto";
import { getUser } from "./services/authService";

// Componente de ruta protegida
const ProtectedRoute = ({ children, loggedIn }) => {
  return loggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getUser()));

  return (
    <Routes>
      <Route path="/login" element={<Login onLoginSuccess={() => setLoggedIn(true)} />} />
      <Route
        path="/"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <Dashboard onLogout={() => setLoggedIn(false)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax"
        element={
          <ProtectedRoute loggedIn={loggedIn}>
            <TaxCalculator />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
