import React, { useState } from "react";
import { Link } from "react-router-dom";
import { logout, getUser } from "../services/authService";

const TaxCalculator = ({ taxRate = 1 }) => {
  const [amount, setAmount] = useState("");       // Precio del producto
  const [baseAmount, setBaseAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const user = getUser(); // obtenemos el usuario actual

  // Al cambiar el precio
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/, "");
    setAmount(value);

    const numericValue = parseFloat(value) || 0;
    const tax = numericValue * (taxRate / 100);
    const base = numericValue - tax;

    setBaseAmount(Math.round(base));
    setTaxAmount(Math.round(tax));
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
    window.location.reload(); // fuerza volver al login
  };

  return (
    <div className="tax-calculator p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">
        Calculadora de Impuesto ({taxRate}%)
      </h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">
          Precio del producto (₡)
        </label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Ej: 5500"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="results bg-blue-100 text-center p-4 rounded shadow mb-4">
        <p>Impuesto ({taxRate}%): ₡{taxAmount}</p>
        <p>Precio menos impuesto: ₡{baseAmount}</p>
      </div>

      <div className="text-center">
        {user?.role === "full" ? (
          // Usuario full → volver al dashboard
          <Link to="/dashboard">
            <button className="btn-primary">Volver al Dashboard</button>
          </Link>
        ) : (
          // Usuario taxOnly → cerrar sesión
          <button className="btn-primary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
};

export default TaxCalculator;
