import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import TaxCalculator from "./Components/TaxCalculator";
import { getUser } from "./services/authService";

function App() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getUser()));

  if (!loggedIn) {
    return <Login onLoginSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard onLogout={() => setLoggedIn(false)} />} />
      <Route path="/tax" element={<TaxCalculator />} />
    </Routes>
  );
}

export default App;
