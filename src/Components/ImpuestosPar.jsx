import React from "react";
import TaxCalculator from "./CalcularImpuesto";

const TaxPair = () => {
  return (
    <div className="tax-pair max-w-md mx-auto space-y-6 p-4">
      {/* Calculadora 1% con botón cerrar sesión */}
      <TaxCalculator taxRate={13} />

      {/* Calculadora 13% sin botón */}
      <TaxCalculator taxRate={1} showLogoutButton />
    </div>
  );
};

export default TaxPair;
