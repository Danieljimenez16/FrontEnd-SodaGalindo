import React, { useState } from "react";
import { Link } from "react-router-dom";

const TaxCalculator = () => {
  const [amount, setAmount] = useState("");       // Precio del producto
  const [baseAmount, setBaseAmount] = useState(0); // Precio después de restar 1%
  const [taxAmount, setTaxAmount] = useState(0);   // 1% calculado

  // Al cambiar el precio
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/, ""); // solo números
    setAmount(value);

    const numericValue = parseFloat(value) || 0;

    const tax = numericValue * 0.01;      // 1% del producto
    const base = numericValue - tax;      // precio menos 1%

    setBaseAmount(Math.round(base));      // redondeamos a entero
    setTaxAmount(Math.round(tax));
  };

  return (
    <div className="tax-calculator p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Calculadora de Impuesto (1%)</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Precio del producto (₡)</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Ej: 5500"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="bg-gray-100 p-3 rounded mb-4">
        <p className="mb-1">1% del precio: ₡{taxAmount}</p>
        <p className="font-bold">Precio menos 1%: ₡{baseAmount}</p>
      </div>

      {/* Botón para volver al dashboard */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <Link to="/">
          <button className="btn-primary">Volver al Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default TaxCalculator;
