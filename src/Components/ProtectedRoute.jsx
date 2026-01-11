import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../services/authService";

const ProtectedRoute = ({ children, requireRole }) => {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  // Si requireRole está definido y el usuario no coincide, redirigir
  if (requireRole && user.role !== requireRole) {
    // Si es taxOnly pero intenta ir al dashboard → redirigir a /tax
    if (user.role === "taxOnly") return <Navigate to="/tax" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
