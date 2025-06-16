/* eslint-disable react/prop-types */
import clsx from "clsx";
import React, { useState, useRef } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdMoreVert,
} from "react-icons/md";
import {
  BGS,
  PRIOTITYSTYELS,
  PRIORITYNAMES,
  TICKET_TYPE,
  formatDate,
  getVencimiento,
} from "../../utils/utils";
import {
  FaSpinner as FaSpinnerSolid,
  FaTrash,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import { BiMessageAltDetail } from "react-icons/bi";
import UserInfo from "../Users/UserInfo";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { updateTicketStatus, deleteTicket } from "../../services/TicketService";
import { toast } from "sonner";
import Button from "react-bootstrap/Button";
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";

const ICONS = {
  1: <MdKeyboardDoubleArrowUp />,
  2: <MdKeyboardArrowUp />,
  3: <MdKeyboardArrowDown />,
};

const Card = ({ ticket, onTicketStatusChange }) => {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const target = useRef(null);

  // Referencias para el overlay
  const overlayRef = useRef(null);

  // Función para mostrar el popover de acciones
  const toggleActions = () => {
    setShowActions(!showActions);
  };

  // Función para manejar completar el ticket
  const handleCompleteTicket = async () => {
    if (!ticket || !ticket.id) {
      toast.error("ID de ticket inválido.");
      return;
    }
    setShowCompleteConfirm(true);
  };

  const confirmCompleteTicket = async () => {
    setShowCompleteConfirm(false);
    setIsCompleting(true);
    try {
      if (ticket?.estado == 1) {
        await updateTicketStatus(ticket.id, 2); // se asigna completado si el estado está actualmente en proceso
      } else await updateTicketStatus(ticket.id, 1); // se asigna en proceso si el estado se encuentra en Completado
      toast.success(`Ticket "${ticket.tema}" marcado como completado.`);
      if (onTicketStatusChange) {
        onTicketStatusChange();
      }
    } catch (error) {
      console.error("Error al completar el ticket:", error);
      toast.error(
        error.response?.data?.message || "Error al completar el ticket."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  // Función para manejar eliminar el ticket
  const handleDeleteTicket = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTicket = async () => {
    setShowDeleteConfirm(false);
    setShowActions(false);
    setIsDeleting(true);
    
    try {
      await deleteTicket(ticket.id);
      toast.success(`Ticket "${ticket.tema}" eliminado correctamente.`);
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar el ticket:", error);
      toast.error(
        error.response?.data?.message || "Error al eliminar el ticket."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full h-full bg-white shadow-md p-4 rounded-xl relative">
        {/* Botón de acciones (tres puntos) */}
        <div className="absolute top-4 right-4">
          <Button
            ref={target}
            variant="light"
            onClick={toggleActions}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MdMoreVert className="text-gray-500 text-xl" />
          </Button>
        </div>

        {/* Overlay para acciones */}
        <Overlay
          show={showActions}
          target={target.current}
          placement="bottom"
          container={overlayRef}
          containerPadding={20}
          rootClose
          onHide={() => setShowActions(false)}
        >
          <Popover id="popover-contained" className="shadow-lg">
            <Popover.Body className="p-2">
              <div className="flex flex-col gap-2">
                <Button
                  variant="light"
                  onClick={handleCompleteTicket}
                  className="flex items-center justify-start px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                >
                  {ticket.estado != 1 ? (
                    <FaLockOpen className="text-blue-500 mr-2" />
                  ) : (
                    <FaLock className="text-blue-500 mr-2" />
                  )}
                  {ticket?.estado != 1 ? "Abrir Ticket" : "Cerrar Ticket"}
                </Button>
                <Button
                  variant="light"
                  onClick={handleDeleteTicket}
                  className="flex items-center justify-start px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-red-600"
                >
                  <FaTrash className="mr-2" />
                  Eliminar Ticket
                </Button>
              </div>
            </Popover.Body>
          </Popover>
        </Overlay>

        <div className="w-full flex justify-evenly items-center ">
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[ticket?.prioridad]
            )}
          >
            <span className="text-lg">{ICONS[ticket?.prioridad]}</span>
            <span className="uppercase">
              prioridad {PRIORITYNAMES[ticket?.prioridad]}{" "}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between mt-2">
          <div>
            <a
              href={`/helpdesk/task/${ticket.id}`}
              className="flex items-center gap-2 hover:text-blue-700 text-decoration-none"
            >
              <div
                className={clsx(
                  "w-4 h-4 rounded-full mt-1",
                  TICKET_TYPE && ticket?.estado
                    ? TICKET_TYPE[ticket.estado]
                    : "bg-gray-400"
                )}
              />
              <span className="font-semibold text-xl line-clamp-1 text-black">
                {ticket?.tema}
              </span>
            </a>
            <div className="mt-1">
              <span className="text-sm text-gray-600">
                Creado: {formatDate(new Date(ticket?.fechaCreacion))}
              </span>
              <br />
              <span className="text-sm text-red-600">
                Vence: {formatDate(new Date(ticket?.fechaVencimiento))}
                <span className="ml-1">
                  {getVencimiento(new Date(ticket?.fechaVencimiento))}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 my-3" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <BiMessageAltDetail />
              <span>
                Area:{" "}
                <span className="text-decoration-underline">
                  {ticket?.departamentoNombre}
                </span>
              </span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600 ">
              <MdAttachFile />
              <span>{ticket?.codigo}</span>
            </div>
          </div>

          <div className="flex flex-row-reverse">
            <div
              key={ticket?.id}
              className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[ticket?.id % BGS?.length]
              )}
            >
              <UserInfo
                name={ticket?.usuarioAsignadoNombres}
                departamento={ticket?.departamentoNombre}
              />
            </div>
          </div>
        </div>

        <div className="py-3">
          <div className="h-fit overflow-hidden text-base line-clamp-1 text-gray-700">
            {ticket?.descripcion}
          </div>
        </div>

        {/* Sección de acciones principales */}
        <div className="w-full pt-3 mt-2 border-t border-gray-200">
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/helpdesk/task/${ticket.id}`)}
              className="w-full flex gap-2 items-center justify-center px-4 py-2 text-sm text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <IoMdAdd className="text-lg" />
              <span>REVISAR TICKET</span>
            </button>
          </div>
        </div>
        <div ref={overlayRef} className="overlay-container"></div>
      </div>

      {/* Diálogo de confirmación para completar/abrir ticket */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar Acción
            </h3>
            <p className="text-sm text-gray-600 m-2">
              ¿Estás seguro de que deseas marcar el ticket{" "}
              <span className="font-semibold">"{ticket?.tema}"</span> como{" "}
              {ticket?.estado == 1 ? "Completado" : "En Proceso"}?
            </p>
            <div className="flex justify-end space-x-3 ">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                disabled={isCompleting}
                className="px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 m-2"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCompleteTicket}
                disabled={isCompleting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors disabled:opacity-50 m-2"
              >
                {isCompleting ? (
                  <FaSpinnerSolid className="animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar ticket */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-600 m-2">
              ¿Estás seguro de que deseas eliminar permanentemente el ticket{" "}
              <span className="font-semibold">"{ticket?.tema}"</span>?
              <br />
              <span className="text-red-500 font-medium">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex justify-end space-x-3 ">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 m-2"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTicket}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors disabled:opacity-50 m-2"
              >
                {isDeleting ? (
                  <FaSpinnerSolid className="animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;