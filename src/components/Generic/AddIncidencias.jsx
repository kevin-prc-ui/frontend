import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Transition } from "@headlessui/react";
import { createIncidencia } from "../../services/IncidenciaService"; // Assuming this service function exists
import { listAllDepartamentos } from "../../services/DepartamentoService";

export const AddIncidencia = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await listAllDepartamentos();
        setDepartamentos(response.data);
      } catch (err) {
        console.error("Error fetching departamentos:", err);
        toast.error("Error al cargar la lista de departamentos.");
      }
    };
    fetchDepartamentos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre de la incidencia es obligatorio.");
      return;
    }
    if (!departamentoId) {
      toast.error("Debe seleccionar un departamento.");
      return;
    }

    setLoading(true);
    setFormError(null);

    const incidenciaData = {
      nombre,
      departamento: { id: departamentoId }, // Assuming backend expects { departamento: { id: ... } }
                                          // or just departamentoId: departamentoId. Adjust as per your API.
    };

    try {
      await createIncidencia(incidenciaData);
      toast.success("Incidencia creada correctamente");
      navigate("/admin/helpdesk/incidencias");
    } catch (err) {
      console.error("Error creating incidencia:", err);
      const errorMessage = err.response?.data?.message || "Error al crear la incidencia. Por favor, inténtelo de nuevo.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition
      as="div"
      appear
      show={true}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg p-4 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Nueva Incidencia
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Incidencia
              </label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                placeholder="Ej: Problema con impresora"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <select
                id="departamento"
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </select>
            </div>

            {formError && (
              <p className="text-red-500 text-sm mb-4 bg-red-100 p-3 rounded">{formError}</p>
            )}

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button type="button" onClick={() => navigate("/admin/helpdesk/incidencias")} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Guardando..." : "Guardar Incidencia"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
};