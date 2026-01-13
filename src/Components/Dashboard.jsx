import { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { guardarResumen, obtenerResumenes, eliminarResumen, actualizarResumen } from "../services/dashboardService";
import { getUser, logout } from "../services/authService";
import { Link } from "react-router-dom";

function Dashboard({ onLogout }) {
  const [user] = useState(() => getUser());
  const [form, setForm] = useState({
    fecha: "",
    ventas: 0,
    municipalidad: 0,
    facturas: 0,
    mesada: 0,
    salarios: 0
  });
  const [resumenes, setResumenes] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openWeek, setOpenWeek] = useState(null);
  const [filtroSemana, setFiltroSemana] = useState("todas");

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2800);
  };

  const loadResumenes = async () => {
    setFetchError(null);
    setShowErrorDetails(false);
    try {
      const data = await obtenerResumenes();
      setResumenes(data.map(r => ({ ...r, id: r._id })));
    } catch (error) {
      console.error("Error al obtener resúmenes:", error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data || error.message;
      setFetchError({
        message: `Error al obtener resúmenes${status ? ` (HTTP ${status})` : ""}: ${serverMsg}`,
        details: error.response ?? error
      });
    }
  };

  useEffect(() => {
    if (!user) {
      if (onLogout) onLogout();
      return;
    }
    (async () => { await loadResumenes(); })();
  }, [user, onLogout]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value
    }));
  };

  const resetForm = () => setForm({ fecha: "", ventas: 0, municipalidad: 0, facturas: 0, mesada: 0, salarios: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editingId) {
        await actualizarResumen(editingId, form);
        showToast("Resumen actualizado correctamente");
        setIsEditing(false);
        setEditingId(null);
      } else {
        await guardarResumen(form);
        showToast("Resumen guardado correctamente");
      }
      resetForm();
      await loadResumenes();
    } catch (error) {
      console.error("Error al guardar/actualizar resumen:", error);
      const msg = error.message || "Error al guardar/actualizar resumen";
      setFetchError({ message: msg, details: error });
    }
  };

  const handleDelete = async (id) => {
    try {
      await eliminarResumen(id);
      await loadResumenes();
      showToast("Resumen eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar resumen:", error);
      const msg = error.message || "Error al eliminar resumen";
      setFetchError({ message: msg, details: error });
    }
  };

  const handleEdit = (id) => {
    const toEdit = resumenes.find(r => r.id === id);
    if (!toEdit) return;
    setForm({
      fecha: toEdit.fecha?.split("T")[0] ?? "",
      ventas: Number(toEdit.ventas) || 0,
      municipalidad: Number(toEdit.municipalidad) || 0,
      facturas: Number(toEdit.facturas) || 0,
      mesada: Number(toEdit.mesada) || 0,
      salarios: Number(toEdit.salarios) || 0
    });
    setIsEditing(true);
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
  };

  // Cálculos del formulario actual
  const calcularTotalGastos = (muni, fact, mes, sal) => {
    return Number(muni) + Number(fact) + Number(mes) + Number(sal);
  };

  const totalGastos = calcularTotalGastos(form.municipalidad, form.facturas, form.mesada, form.salarios);
  const gananciaFinal = Number(form.ventas) - totalGastos;

  // Calcular total de ganancias de todos los resúmenes
  const totalGananciasAll = resumenes.reduce((acc, r) => {
    const rTotal = r.totalGastos ?? calcularTotalGastos(r.municipalidad, r.facturas, r.mesada, r.salarios);
    const rGain = r.gananciaFinal ?? (Number(r.ventas) - rTotal);
    return acc + Number(rGain || 0);
  }, 0);

  const formatColones = (num) => `₡ ${Number(num).toLocaleString()}`;

  // Agrupar resúmenes por semana
  const agruparPorSemana = () => {
    const grupos = {};
    
    resumenes.forEach(r => {
      if (!r.fecha) return;
      
      const fechaObj = new Date(r.fecha);
      const lunes = startOfWeek(fechaObj, { weekStartsOn: 1 });
      const domingo = endOfWeek(fechaObj, { weekStartsOn: 1 });
      
      // Clave única para la semana
      const weekKey = format(lunes, "yyyy-MM-dd");
      
      if (!grupos[weekKey]) {
        grupos[weekKey] = {
          lunes,
          domingo,
          resumenes: []
        };
      }
      
      grupos[weekKey].resumenes.push(r);
    });
    
    return grupos;
  };

  const semanas = agruparPorSemana();
  
  // Ordenar semanas de más reciente a más antigua
  const semanasOrdenadas = Object.entries(semanas).sort((a, b) => {
    return new Date(b[0]) - new Date(a[0]);
  });

  // Filtrar semanas según el filtro seleccionado
  const semanasFiltradas = filtroSemana === "todas" 
    ? semanasOrdenadas 
    : semanasOrdenadas.filter(([weekKey]) => weekKey === filtroSemana);

  const formatearRangoSemana = (lunes, domingo) => {
    const lunesStr = format(lunes, "dd/MM");
    const domingoStr = format(domingo, "dd/MM");
    return `${lunesStr} al ${domingoStr}`;
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 className="dashboard-title">Dashboard Financiero</h1>
        <div style={{ textAlign: 'right' }}>
          {user && <div className="welcome">Bienvenido, {user.username}</div>}
          <button className="logout-btn" style={{ marginTop: 8 }} onClick={() => { logout(); if (onLogout) onLogout(); }}>
            Cerrar sesión
          </button>
          <div style={{ marginBottom: 16 }}>
            <Link to="/tax">
              <button className="btn-primary">Ir a Calculadora de Impuestos</button>
            </Link>
          </div>
        </div>
      </div>

      <div className={`toast ${showSuccess ? 'show' : ''}`} role="status" aria-live="polite">
        {successMessage}
      </div>

      {fetchError && (
        <div className="error-banner" role="alert" aria-live="assertive" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 700 }}>Hubo un problema al cargar los resúmenes</div>
            <div style={{ color: '#fff', opacity: 0.9 }}>{fetchError.message}</div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }} className="error-actions">
            <button className="btn" onClick={loadResumenes}>Reintentar</button>
            <button className="btn-delete" onClick={() => setFetchError(null)}>Descartar</button>
            <button className="btn" onClick={() => setShowErrorDetails(s => !s)} style={{ background: '#374151', borderRadius: 8 }}>
              {showErrorDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
            </button>
          </div>
          {showErrorDetails && (
            <pre className="error-details" style={{ marginTop: 12, background: '#111827', color: '#fff', padding: 12, borderRadius: 8, overflow: 'auto' }}>
              {JSON.stringify(fetchError.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Formulario */}
      <div className="form-container">
        <h2>{isEditing ? 'Editar Resumen' : 'Registrar Resumen Diario'}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Fecha:</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Ventas (₡):</label>
            <input type="number" name="ventas" placeholder="₡ 0" value={form.ventas} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Municipalidad (₡):</label>
            <input type="number" name="municipalidad" placeholder="₡ 0" value={form.municipalidad} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Facturas (₡):</label>
            <input type="number" name="facturas" placeholder="₡ 0" value={form.facturas} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mesada (₡):</label>
            <input type="number" name="mesada" placeholder="₡ 0" value={form.mesada} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Salarios (₡):</label>
            <input type="number" name="salarios" placeholder="₡ 0" value={form.salarios} onChange={handleChange} />
          </div>

          <div className="preview">
            <span>Total Gastos: {formatColones(totalGastos)}</span>
            <span className={gananciaFinal >= 0 ? "positive" : "negative"}>
              {formatColones(gananciaFinal)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="submit" className="btn-submit">
              {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="totals-panel form-totals" aria-live="polite">
          <div className="totals-card light">
            <div className="totals-label">Total Ganancia (todas las facturas)</div>
            <div className="totals-value">{formatColones(totalGananciasAll)}</div>
            <div className="totals-sub">Suma de la ganancia final de cada resumen</div>
          </div>
        </div>
      </div>

      {/* Resúmenes por semana */}
      <div className="weekly-resumenes" style={{ marginTop: 32 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          gap: 20
        }}>
          <h2 style={{ margin: 0, color: '#fff' }}>Resúmenes por Semana</h2>
          
          {semanasOrdenadas.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              marginLeft: 'auto'
            }}>
              <label htmlFor="filtro-semana" style={{ 
                fontWeight: 500, 
                color: '#fff',
                whiteSpace: 'nowrap'
              }}>
                Filtrar:
              </label>
              <select
                id="filtro-semana"
                value={filtroSemana}
                onChange={(e) => {
                  setFiltroSemana(e.target.value);
                  setOpenWeek(null);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  minWidth: 200
                }}
              >
                <option value="todas">Todas las semanas</option>
                {semanasOrdenadas.map(([weekKey, semanaData]) => (
                  <option key={weekKey} value={weekKey}>
                    {formatearRangoSemana(semanaData.lunes, semanaData.domingo)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {semanasFiltradas.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 24 }}>
            No hay resúmenes registrados aún.
          </p>
        )}

        {semanasFiltradas.map(([weekKey, semanaData]) => {
          const rangoSemana = formatearRangoSemana(semanaData.lunes, semanaData.domingo);
          const cantidadFacturas = semanaData.resumenes.length;
          const estaAbierta = openWeek === weekKey;

          return (
            <div key={weekKey} className="week-block" style={{ marginBottom: 16 }}>
              <button
                className="logout-btn"
                onClick={() => setOpenWeek(estaAbierta ? null : weekKey)}
                style={{ width: '100%', textAlign: 'left' }}
              >
                {rangoSemana} ({cantidadFacturas} {cantidadFacturas === 1 ? 'factura' : 'facturas'})
              </button>

              {estaAbierta && (
                <table className="week-table" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Ventas</th>
                      <th>Municipalidad</th>
                      <th>Facturas</th>
                      <th>Mesada</th>
                      <th>Salarios</th>
                      <th>Total Gastos</th>
                      <th>Ganancia Final</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semanaData.resumenes.map((r) => {
                      const rowTotal = r.totalGastos ?? calcularTotalGastos(r.municipalidad, r.facturas, r.mesada, r.salarios);
                      const rowGanancia = r.gananciaFinal ?? (Number(r.ventas) - rowTotal);
                      
                      return (
                        <tr key={r.id}>
                          <td>{r.fecha?.split("T")[0]}</td>
                          <td>{formatColones(r.ventas)}</td>
                          <td>{formatColones(r.municipalidad)}</td>
                          <td>{formatColones(r.facturas)}</td>
                          <td>{formatColones(r.mesada)}</td>
                          <td>{formatColones(r.salarios)}</td>
                          <td>{formatColones(rowTotal)}</td>
                          <td className={rowGanancia >= 0 ? "positive" : "negative"}>
                            {formatColones(rowGanancia)}
                          </td>
                          <td style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-edit" onClick={() => handleEdit(r.id)}>
                              Editar
                            </button>
                            <button className="btn-delete" onClick={() => handleDelete(r.id)}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;