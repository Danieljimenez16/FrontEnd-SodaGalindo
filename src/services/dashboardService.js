// src/services/dashboardService.js
import axios from "axios";

// URL de tu backend Node.js (cambiar al deploy de Render en producción)
const API_URL = "https://backendsoda-galindo.onrender.com/api/dashboard";

// Guardar un resumen diario
export const guardarResumen = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/guardar`, data);
    return response.data;
  } catch (error) {
    console.error("Error al guardar resumen:", error.response ?? error);
    throw error;
  }
};

// Obtener todos los resúmenes
export const obtenerResumenes = async () => {
  try {
    const response = await axios.get(`${API_URL}/resumenes`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener resúmenes:", error.response ?? error);
    throw error;
  }
};

// Eliminar un resumen por ID
export const eliminarResumen = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar resumen:", error.response ?? error);
    const msg = error.response?.data?.message || error.message || "Error al eliminar resumen";
    throw new Error(msg);
  }
};

// Actualizar un resumen por ID
export const actualizarResumen = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar resumen:", error.response ?? error);
    const msg = error.response?.data?.message || error.message || "Error al actualizar resumen";
    throw new Error(msg);
  }
};
