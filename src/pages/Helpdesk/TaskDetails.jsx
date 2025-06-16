import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTicketById } from "../../services/TicketService";
import { toast } from "sonner";
import {
  FaTicketAlt,
  FaInfoCircle,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaPencilAlt,
} from "react-icons/fa";
import ChatContainer from "../../components/Chat/ChatContainer";
import { getBadgeColor, getPriorityColor, getVencimiento } from "../../utils/utils";
import CreateTicket from "../../components/Ticket/CreateTicket";
import { getPermisos } from "../../services/UsuarioService";

//  * @component TaskDetails
//  * @description Muestra los detalles completos de un ticket y su chat asociado.
//  */
const TaskDetails = () => {
  const params = useParams();

  const id = params?.id || ""; // Ticket ID
  const [openDialog, setOpenDialog] = useState(false);
  const [permisos, setPermisos] = useState("");

  // --- Ticket State ---
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [ticketError, setTicketError] = useState(null);
  // --- Chat State ---
  // --- Fetch Ticket Details ---
  useEffect(() => {
    if (id) {
      setPermisos([]);
      setLoadingTicket(true);
      setTicketError(null);
      getPermisos().then((response) => {
        setPermisos(response.data);
      });
      getTicketById(id)
        .then((response) => {
          if (response.data) {
            // *** CRUCIAL: Check for chatId ***
            setTicket(response.data);
          }
        })
        .catch((err) => {
          console.error("Error al cargar el ticket:", err);
          const errorMessage =
            err.response?.data?.message || "Error al cargar el ticket.";
          setTicketError(errorMessage);
          setTicket(null);
          toast.error(errorMessage);
        })
        .finally(() => setLoadingTicket(false));
    } else {
      setTicketError("No se proporcionó un ID de ticket válido.");
      setLoadingTicket(false);
      toast.error("ID de ticket inválido.");
    }
  }, [id]);

  const editarTicket = () => {
    permisos.map((permiso) => {
      console.log(permiso.nombre);
      
      if (permiso.nombre.includes("EDITAR_TICKET")) {
        setOpenDialog(true);
      }
    });
  };

  // --- Se renderiza la pantalla de  ---
  if (loadingTicket) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-lg font-medium text-gray-600">
            Cargando detalles del ticket...
          </p>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (ticketError || !ticket) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-center rounded-lg shadow-lg p-4 max-w-md">
          <FaExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-gray-600">
            {`El ticket ${id} no pudo ser encontrado o está incompleto.`}
            <br></br>
            Contacte a Ivan de sistemas.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // --- Render Main Content (Ticket Details + Chat) ---
  return (
    <div className="h-1 p-4 md:p-6">
      {/* Contenedor principal que alinea el botón (izquierda) y el contenido principal (derecha) */}
      {/* 'items-center' centrará verticalmente el botón respecto al bloque de contenido de la derecha */}
      <div className="max-w-7x2 mx-auto flex flex-row items-center gap-x-4 md:gap-x-6">
        {/* Contenedor del Botón Volver */}
        <div className="flex-shrink-0">
          {" "}
          <button
            onClick={() => window.history.back()}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </button>
        </div>

        {/* Contenedor para las dos columnas (detalles del ticket y chat) */}
        <div className="flex-grow flex flex-col lg:flex-row gap-6 md:gap-8">
          {" "}
          {/* flex-grow para que ocupe el espacio restante. El gap original se mantiene para la disposición interna. */}
          {/* Columna Izquierda: Detalles del Ticket */}
          <div className="lg:w-1/2 xl:w-3/5 flex-shrink-0 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaTicketAlt className="mr-3 text-blue-600" />
                Ticket:{" "}
                <span className="ml-2 font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-lg">
                  {ticket.codigo || ticket.id}
                </span>
              </h1>
              <span className="text-red-600 italic">
                {getVencimiento(new Date(ticket.fechaVencimiento))}
              </span>
            </div>
            <div className="p-1 space-y-5">
              {/* Sections remain the same as before */}
              <DetailSection
                title="Información General"
                icon={<FaInfoCircle className="text-green-600" />}
                actionButton={
                  <button
                    onClick={() => editarTicket()}
                    className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Editar Ticket"
                  >
                    <FaPencilAlt className="h-4 w-4" />
                  </button>
                }
              >
                <DetailItem label="Tema" value={ticket.tema} />
                <DetailItem
                  label="Estado"
                  value={ticket.estadoNombre}
                  badgeColor={getBadgeColor(ticket.estadoNombre)}
                />
                <DetailItem
                  label="Prioridad"
                  value={ticket.prioridadNombre}
                  badgeColor={getPriorityColor(ticket.prioridadNombre)}
                />
                <DetailItem
                  label="Departamento"
                  value={ticket.departamentoNombre}
                />
                <DetailItem
                  label="Incidencia"
                  value={ticket.incidenciaNombre}
                />
                <DetailItem label="Motivo" value={ticket.motivoNombre} />
                <DetailItem label="Fuente" value={ticket.fuenteNombre} />
                <DetailItem label="Descripcion" value={ticket.descripcion} />
              </DetailSection>
              <DetailSection
                title="Detalles"
                icon={<FaCalendarAlt className="text-purple-600" />}
              >
                <DetailItem
                  label="Creado"
                  value={formatDateTime(ticket.fechaCreacion)}
                  icon={<FaClock className="text-gray-400" />}
                />
                <DetailItem
                  label="Modificado"
                  value={formatDateTime(ticket.fechaActualizacion)}
                  icon={<FaClock className="text-gray-400" />}
                />
                <DetailItem
                  label="Vencimiento"
                  value={formatDateTime(ticket.fechaVencimiento, true)}
                  icon={<FaClock className="text-gray-400" />}
                />
              </DetailSection>

              <DetailSection
                title="Usuarios"
                icon={<FaUser className="text-yellow-600" />}
              >
                <DetailItem
                  label="Creador"
                  value={ticket.usuarioCreadorNombres || "No asignado"}
                />
                <DetailItem
                  label="Asignado"
                  value={ticket.usuarioAsignadoNombres || "No asignado"}
                />
              </DetailSection>
            </div>
          </div>
          {/* Columna Derecha: Chat */}
          <div className="flex-1 lg:w-1/2 xl:w-20 min-h-[600px] lg:min-h-0">
            {/* Pass necessary props to ChatComponent */}
            <ChatContainer ticketId={id} chatId={ticket.chatId} />
          </div>
        </div>
      </div>
      <CreateTicket open={openDialog} setOpen={setOpenDialog} ticket={ticket} />
    </div>
  );
};

const DetailSection = ({ title, icon, children, actionButton }) => (
  <div className="border border-gray-200 rounded-md m-1 p-3">
    <div className="flex justify-between items-center mb-4 border-b pb-2">
      <h3 className="text-md font-semibold text-gray-700 flex items-center">
        {icon &&
          React.cloneElement(icon, {
            // Aseguramos que className exista y añadimos mr-2
            className: `${icon.props.className || ""} mr-2 w-4 h-4`,
          })}
        {title}
      </h3>
      {actionButton && <div>{actionButton}</div>}
    </div>
    <div className="space-y-2 pl-1">{children}</div>
  </div>
);

const DetailItem = ({ label, value, badgeColor, icon }) => (
  <div className="grid grid-cols-3 gap-x-2 items-start">
    <dt className="text-xs font-medium text-gray-500 col-span-1 truncate">
      {label}:
    </dt>
    <dd
      className={`text-xs text-gray-800 col-span-2 flex items-center ${
        badgeColor ? "inline-block" : ""
      }`}
    >
      {icon &&
        React.cloneElement(icon, {
          className: `${icon.props.className} mr-1 w-3 h-3 flex-shrink-0`,
        })}
      {badgeColor ? (
        <span
          className={`px-1.5 py-0.5 rounded-full font-semibold text-[11px] leading-tight ${badgeColor}`}
        >
          {value || "N/A"}
        </span>
      ) : (
        value || <span className="text-gray-400 italic">No especificado</span>
      )}
    </dd>
  </div>
);

// --- Funciones Auxiliares (formatDateTime, getBadgeColor, getPriorityColor - slightly adapted) ---
const formatDateTime = (dateTimeString, isDueDate = false) => {
  if (!dateTimeString) return "N/A";
  try {
    const date = new Date(dateTimeString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    if (isDueDate) {
      // Para fechas de vencimiento (yyyy-mm-dd), interpretar y mostrar en UTC para evitar corrimiento de día.
      // No se muestra la hora ya que la fecha de vencimiento usualmente se refiere al día completo.
      options.timeZone = "UTC";
    } else {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return date.toLocaleDateString("es-ES", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateTimeString; // Return original string on error
  }
};

// Updated to use names directly as passed in ticket object

export default TaskDetails;
