import React, { useState, useEffect, useCallback } from "react";
import { DialogTitle } from "@headlessui/react";
import ModalWrapper from "../ModalWrapper";
import Button from "../Button";
import clsx from "clsx";
import { useForm, Controller } from "react-hook-form"; // Importa Controller
import {
  createTicket,
  updateTicket, // Necesitamos una nueva función en el servicio
  // listIncidenciasBydepartamento // Opcional: si prefieres cargar bajo demanda
} from "../../services/TicketService";
import { listAllIncidencias } from "../../services/IncidenciaService";
import { listAllPrioridades } from "../../services/PrioridadService";
import { listAllMotivos } from "../../services/MotivoService";
import { listAllDepartamentos } from "../../services/DepartamentoService";
import { getUserId, listUsers } from "../../services/UsuarioService";
import { toast } from "sonner";
// const PRIORITIES = ["Baja", "Media", "Alta"];

export default function CreateTicket({
  open,
  setOpen,
  refreshTickets,
  ticket,
}) {
  const [loading, setLoading] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingIncs, setLoadingIncs] = useState(false);
  const [usuarioCreador, setUsuarioCreador] = useState();
  const [departamentos, setDepartamentos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [allIncidencias, setAllIncidencias] = useState([]); // Guarda todas las incidencias
  // const { isAuth, getAllUsers } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    control, // Necesario para Controller
    watch, // Para observar cambios en los campos
    setValue, // Para establecer valores programáticamente
    formState: { errors },
  } = useForm({
    // Inicializa defaultValues con los datos del ticket si existe, de lo contrario usa valores vacíos
    defaultValues: ticket
      ? {
          tema: ticket.tema || "",
          fechaVencimiento: ticket.fechaVencimiento
            ? new Date(ticket.fechaVencimiento).toISOString().split("T")[0]
            : "", // Formato YYYY-MM-DD
          descripcion: ticket.descripcion || "",
          usuarioCreador: ticket.usuarioCreador || "", // Asume que usuarioCreador es un objeto con id
          usuarioAsignado: ticket.usuarioAsignado || "", // Asume que usuarioAsignado es un objeto con id
          departamento: ticket.departamento || "", // Asume que departamento es un objeto con id
          fuente: ticket.fuente || "", // Asume que fuente es un objeto con id
          incidencia: ticket.incidencia || "", // Asume que incidencia es un objeto con id
          motivo: ticket.motivo || "", // Asume que motivo es un objeto con id
          prioridad: ticket.prioridad || "", // Asume que prioridad es un objeto con id
        }
      : {
          tema: "",
          fechaVencimiento: "",
          descripcion: "",
          usuarioCreador: "", // Este campo no debería ser editable por el usuario
          usuarioAsignado: "",
          departamento: "",
          fuente: "", // Este campo no debería ser editable por el usuario
          incidencia: "",
          motivo: "",
          estado: "", // El estado probablemente no se edita en este formulario
          prioridad: "",
        },
  });
  // Incidencias filtradas basadas en el departamento seleccionado
  const [filteredIncidencias, setFilteredIncidencias] = useState([]);

  // Observa los cambios en los selects
  const watcheddepartamento = watch("departamento");
  const watchedincidencia = watch("incidencia");

  // --- Carga Inicial de Datos ---
  const loadInitialData = useCallback(async () => {
    setLoadingDeps(true);
    setLoadingIncs(true);
    try {
      const [depRes, incRes, prioRes, motRes, userCRes] = await Promise.all([
        listAllDepartamentos(),
        listAllIncidencias(), // Llama a la nueva función del servicio
        listAllPrioridades(),
        listAllMotivos(),
        getUserId(),
      ]);
      setDepartamentos(depRes.data || []);
      setPrioridades(prioRes.data || []);
      setAllIncidencias(incRes.data || []);
      setMotivos(motRes.data || []);
      setUsuarioCreador(userCRes.data || []);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("Error al cargar datos. Contacte a sistemas.");
      // Opcional: cerrar modal si falla la carga esencial
      // closeDialog();
    } finally {
      setLoadingDeps(false);
      setLoadingIncs(false);
    }
  }, []); // Sin dependencias, se llama una vez

  // Cargar usuarios solo cuando se abre el modal o cambia el departamento
  const loadUsers = useCallback(async (departamentoId = null) => {
    setLoadingDeps(true); // Reutilizamos este loading para usuarios también
    try {
      const userRes = await listUsers(departamentoId); // Asume que listUsers puede filtrar por departamento
      setUsuarios(userRes.data || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar usuarios. Contacte a sistemas.");
    } finally {
      setLoadingDeps(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      // Resetea estados cuando se cierra el modal para evitar datos viejos
      setAllIncidencias([]);
      setFilteredIncidencias([]);
    }
  }, [open, loadInitialData]);

  // --- Lógica de Selects Dependientes y Auto-asignación ---

  // Efecto para filtrar incidencias y usuarios cuando cambia el departamento seleccionado
  useEffect(() => {
    if (watcheddepartamento) {
      const deptId = parseInt(watcheddepartamento, 10);
      // Carga usuarios filtrados por el departamento seleccionado
      loadUsers(deptId);

      // Filtra incidencias que pertenecen al departamento seleccionado
      const filteredInc = allIncidencias.filter(
        (inc) => inc.departamento.id === deptId
      );
      setFilteredIncidencias(filteredInc);
      // Ya no necesitamos filteredUsuarios state, usamos el usuarios state cargado por loadUsers
      // setFilteredUsuarios(filteredUsers);
      // Podríamos resetear incidencia si el departamento cambia y la incidencia actual no pertenece al nuevo
      // setValue("incidencia", "", { shouldValidate: false }); // Descomentar si se desea este comportamiento
    } else {
      setFilteredIncidencias([]); // Limpia si no hay departamento seleccionado
    }
  }, [watcheddepartamento, allIncidencias]);

  // Efecto para auto-asignar departamento cuando cambia la incidencia seleccionada
  useEffect(() => {
    if (watchedincidencia) {
      const incId = parseInt(watchedincidencia, 10);
      const selectedIncidencia = allIncidencias.find((inc) => inc === incId);

      if (selectedIncidencia?.departamento) {
        const targetdepartamento =
          selectedIncidencia.departamento.id.toString(); // Asegura que sea string para el <select>
        const currentdepartamento = watcheddepartamento;

        // Solo actualiza si el departamento asociado a la incidencia es diferente al seleccionado actualmente
        if (currentdepartamento !== targetdepartamento) {
          setValue("departamento", targetdepartamento, {
            shouldValidate: true,
          });
          // El efecto anterior (watcheddepartamento) se encargará de re-filtrar las incidencias
        }

        // Lógica específica para asignar automáticamente "Sistemas" (si es necesario)
        // Esta parte del requerimiento original ("cuando se seleccione una incidencia del departamento de sistemas, se asigne automaticamente el departamento")
        // ya está cubierta por la lógica general anterior. Si una incidencia pertenece a Sistemas,
        // se seleccionará Sistemas en el dropdown de departamento.
      }
    }
    // No añadir setValue a las dependencias para evitar bucles infinitos
  }, [watchedincidencia, allIncidencias]); // Solo depende de la incidencia y la lista completa

  // Efecto para resetear el formulario cuando el modal se abre con un ticket diferente
  useEffect(() => {
    if (open && ticket) {
      // Resetear el formulario con los valores del ticket
      reset({
        tema: ticket.tema || "",
        fechaVencimiento: ticket.fechaVencimiento
          ? new Date(ticket.fechaVencimiento).toISOString().split("T")[0]
          : "",
        descripcion: ticket.descripcion || "",
        usuarioAsignado: ticket.usuarioAsignado || "",
        departamento: ticket.departamento || "",
        incidencia: ticket.incidencia || "",
        motivo: ticket.motivo || "",
        prioridad: ticket.prioridad || "",
      });
      // Asegurarse de que las incidencias y usuarios filtrados se carguen si hay un departamento en el ticket
      if (ticket.departamento) {
        const deptId = ticket.departamento;
        // Esto debería ser manejado por el efecto de watcheddepartamento si setValue lo dispara
        // Pero si el departamento ya estaba seleccionado, el efecto no se dispararía.
        // Podríamos llamar a loadUsers y filtrar incidencias aquí también si es necesario.
        const filteredInc = allIncidencias.filter(
          (inc) => inc.departamento.id === parseInt(deptId, 10)
        );
        setFilteredIncidencias(filteredInc);
        loadUsers(parseInt(deptId, 10));
      }
    } else if (!open) {
      // Resetear el formulario a valores vacíos cuando se cierra
      reset({
        tema: "",
        fechaVencimiento: "",
        descripcion: "",
        usuarioAsignado: "",
        departamento: "",
        incidencia: "",
        motivo: "",
        prioridad: "",
      });
      setFilteredIncidencias([]);
      setUsuarios([]); // Limpiar usuarios también
    }
  }, [open, ticket, reset, allIncidencias, loadUsers]); // Depende de open, ticket, reset, allIncidencias, loadUsers

  const closeDialog = () => {
    reset(); // Limpia react-hook-form
    setFilteredIncidencias([]); // Limpia estado local
    setOpen(false);
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const ticketData = {
        tema: data.tema,
        fechaVencimiento: data.fechaVencimiento,
        descripcion: data.descripcion,
        usuarioCreador: usuarioCreador, // Usar el ID del usuario creador obtenido
        usuarioAsignado: parseInt(data.usuarioAsignado),
        departamento: parseInt(data.departamento),
        fuente: 1, // Asumimos fuente fija por ahora
        incidencia: parseInt(data.incidencia),
        motivo: parseInt(data.motivo),
        estado: 1,
        prioridad: parseInt(data.prioridad),
      };
      if (ticket?.id) {
        await updateTicket(ticket.id, ticketData);
        window.location.reload();
        toast.success("Ticket actualizado exitosamente.");
      } else {
        await createTicket(ticketData);
        window.location.reload();
        toast.success("Ticket creado exitosamente.");
      }
      toast.success("Ticket creado exitosamente.");
      if (refreshTickets) {
        refreshTickets();
      }
      closeDialog();
    } catch (error) {
      console.error("Error al crear el ticket:", error);
      const errorMsg =
        error.response?.data?.message || "Error al crear el ticket.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  const isLoadingData = loadingDeps || loadingIncs;
  // Actualizar texto del botón de submit
  const submitButtonText = () => {
    if (loading) return ticket?.id ? "Actualizando..." : "Creando...";
    return ticket?.id ? "Actualizar Ticket" : "Crear Ticket";
  };

  return (
    <>
      <ModalWrapper
        open={open}
        setOpen={closeDialog}
        title={
          <DialogTitle className="text-lg font-semibold leading-6 text-gray-900 text-center">
            {ticket?.id ? "Editar Ticket" : "Crear Ticket"}
          </DialogTitle>
        }
        footer={
          <div className="sm:flex sm:flex-row-reverse gap-4">
            <Button
              type="submit"
              form="create-ticket-form"
              className={clsx(
                "px-8 text-sm font-semibold text-white sm:w-auto",
                "bg-blue-600 hover:bg-blue-700",
                (loading || isLoadingData) && "opacity-50 cursor-not-allowed"
              )}
              label={submitButtonText()}
              onClick={handleSubmit(handleFormSubmit)}
              disabled={loading || isLoadingData}
            />
            <Button
              type="button"
              className="bg-white px-8 text-sm font-semibold text-gray-900 sm:w-auto border hover:bg-gray-50"
              onClick={() => closeDialog()}
              label="Cancelar"
              disabled={loading}
            />
          </div>
        }
      >
        {/* El formulario ahora solo envuelve los campos (children del ModalWrapper) */}
        {/* Se le da un ID para vincularlo con el botón de submit externo */}
        <form id="create-ticket-form" className="w-full">
          <div className="flex flex-col gap-4">
            {" "}
            {/* Contenedor para los campos con espaciado */}
            {/* Campo Título */}
            <div className="w-full">
              <label
                htmlFor="tema"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Título
              </label>
              <input
                type="text"
                id="tema"
                {...register("tema", { required: "El título es obligatorio" })}
                placeholder="Título del ticket"
                className={clsx(
                  "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  errors.tema && "border-red-500"
                )}
              />
              {errors.tema && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tema.message}
                </p>
              )}
            </div>
            {/* Campo Descripción */}
            <div className="w-full">
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="descripcion"
                rows={4}
                maxLength={500}
                {...register("descripcion", {
                  required: "La descripción es obligatoria",
                })}
                placeholder="Describe el problema o solicitud"
                className={clsx(
                  "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                  errors.descripcion && "border-red-500"
                )}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.descripcion.message}
                </p>
              )}
            </div>
            {/* Campo Fecha de Vencimiento */}
            <div className="w-full">
              <label
                htmlFor="fechaVencimiento"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de vencimiento:
              </label>{" "}
              <Controller
                name="fechaVencimiento" // Corregido name
                control={control}
                rules={{ required: "La fecha es obligatoria" }}
                render={({ field }) => (
                  <input type="date" id="fechaVencimiento" {...field} />
                )}
              />
              {errors.fechaVencimiento && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fechaVencimiento.message}
                </p>
              )}{" "}
              {/* Corregido error check */}
            </div>
            {/* Campo Departamento */}
            <div className="w-full">
              <label
                htmlFor="departamento"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Departamento
              </label>
              <Controller
                name="departamento"
                control={control}
                rules={{ required: "El departamento es obligatorio" }}
                render={({ field }) => (
                  <select
                    id="departamento"
                    disabled={loadingDeps || loading} // Deshabilitado mientras carga o envía
                    className={clsx(
                      "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                      errors.departamento && "border-red-500"
                    )}
                    {...field}
                  >
                    <option value="" disabled>
                      {loadingDeps
                        ? "Cargando..."
                        : "Selecciona un departamento"}
                    </option>
                    {departamentos.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.departamento && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.departamento.message}
                </p>
              )}
            </div>
            {/* Campo Usuario (Agente Asignado) */}
            <div className="w-full">
              <label
                htmlFor="usuarioAsignado"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Agente:
              </label>
              <Controller
                name="usuarioAsignado"
                control={control}
                rules={{ required: "El agente es obligatorio" }} // Mensaje de error más específico
                render={({ field }) => (
                  <select
                    id="usuarioAsignado"
                    className={clsx(
                      "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                      errors.usuarioAsignado && "border-red-500"
                    )}
                    {...field}
                  >
                    <option value="" disabled>
                      {loadingDeps ? "Cargando..." : "Selecciona un agente"}
                    </option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.usuarioAsignado && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.usuarioAsignado.message}
                </p>
              )}
            </div>
            {/* Campo Incidencia */}
            <div className="w-full">
              <label
                htmlFor="incidencia"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Incidencia
              </label>
              <Controller
                name="incidencia"
                control={control}
                rules={{ required: "La incidencia es obligatoria" }}
                render={({ field }) => (
                  <select
                    id="incidencia"
                    disabled={
                      !watcheddepartamento ||
                      loadingIncs ||
                      loadingDeps ||
                      loading
                    }
                    className={clsx(
                      "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                      errors.incidencia && "border-red-500",
                      (!watcheddepartamento || loadingIncs) &&
                        "bg-gray-100 cursor-not-allowed"
                    )}
                    {...field}
                  >
                    <option value="" disabled>
                      {!watcheddepartamento
                        ? "Selecciona un departamento primero"
                        : loadingIncs
                        ? "Cargando incidencias..."
                        : filteredIncidencias.length === 0
                        ? "No hay incidencias para este depto."
                        : "Selecciona una incidencia"}
                    </option>
                    {filteredIncidencias.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {inc.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.incidencia && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.incidencia.message}
                </p>
              )}
            </div>
            {/* Campo Motivo*/}
            <div className="w-full">
              <label
                htmlFor="motivo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motivo:
              </label>{" "}
              <Controller
                name="motivo" // Corregido name
                control={control}
                rules={{ required: "El motivo es obligatorio" }}
                render={({ field }) => (
                  <select
                    id="motivo" // Corregido id
                    className={clsx(
                      "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                      errors.motivo && "border-red-500"
                    )} // Corregido error check
                    {...field}
                  >
                    <option value="" disabled>
                      {loadingDeps ? "Cargando..." : "Asigne el motivo"}
                    </option>
                    {/* Asume que motivo es [{id, nombre}] */}
                    {motivos.map((mot) => (
                      <option key={mot.id} value={mot.id}>
                        {mot.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.motivo && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.motivo.message}
                </p>
              )}{" "}
              {/* Corregido error check */}
            </div>
            {/* Campo Prioridad*/}
            <div className="w-full">
              <label
                htmlFor="prioridad"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prioridad:
              </label>{" "}
              <Controller
                name="prioridad" // Corregido name
                control={control}
                rules={{ required: "La prioridad es obligatoria" }}
                render={({ field }) => (
                  <select
                    id="prioridad" // Corregido id
                    className={clsx(
                      "w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                      errors.prioridad && "border-red-500"
                    )} // Corregido error check
                    {...field}
                  >
                    <option value="" disabled>
                      {loadingDeps ? "Cargando..." : "Asigne la prioridad"}
                    </option>
                    {/* Asume que prioridades es [{id, nombre}] */}
                    {prioridades.map((prio) => (
                      <option key={prio.id} value={prio.id}>
                        {prio.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.prioridad && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.prioridad.message}
                </p>
              )}{" "}
              {/* Corregido error check */}
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
}
