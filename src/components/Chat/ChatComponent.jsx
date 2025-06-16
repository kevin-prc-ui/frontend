// C:/react/Proyecto/frontend/src/components/Chat/ChatComponent.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaComments,
  FaPaperPlane,
  FaFileUpload,
  FaSpinner,
  FaExclamationCircle,
  FaTimes, // Icono para eliminar archivo
  FaDownload // Icono para descargar archivo
} from "react-icons/fa";
import { getAuthToken } from "../../services/AuthService";
// Ya no necesitamos postChatMessage ni toast aquí, el padre maneja el envío y errores
// import { postChatMessage } from "../../services/ChatService";
// import { toast } from "sonner";

// --- Helper Function to format timestamp ---
const formatChatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  try {
    // Asegurarse de que el timestamp sea un formato válido para el constructor de Date
    const date = new Date(timestamp);
    // Validar si la fecha es válida
    if (isNaN(date.getTime())) {
        console.warn("Timestamp inválido recibido:", timestamp);
        return "Fecha inválida";
    }
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting timestamp:", timestamp, e);
    return "Error fecha";
  }
};

// --- Main Chat Component ---
const ChatComponent = ({
  // chatId, // No se usa directamente en este componente refactorizado
  messages = [], // Array de objetos mensaje { id, sender: { id, nombres }, content, timestamp, messageType, attachmentUrl, attachmentFilename, ... }
  onSendMessage, // Función para llamar al enviar: (messageContent: string, files: File[]) => Promise<void>
  isConnected, // Boolean indicando estado de conexión WebSocket
  isConnecting, // Boolean indicando si está intentando conectar
  isLoadingMessages, // Boolean indicando si se están cargando mensajes iniciales
  currentUserId, // ID del usuario logueado (para identificar mensajes propios)
  connectionError, // Mensaje de error de conexión
}) => {
  const [message, setMessage] = useState("");
  // Cambiado para manejar un solo archivo seleccionado
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref para scroll al final
  const textareaRef = useRef(null); // Ref para auto-resize del textarea

  // Scroll al final cuando los mensajes cambian
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize del textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto"; // Reset height
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`; // Nueva height, max 96px (aprox 4 filas)
    }
  }, [message]); // Depende del contenido del mensaje

  // --- Lógica de Manejo de Archivos ---
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Archivo no soportado: ${file.name} (Tipo: ${file.type || "desconocido"}). Permitidos: PNG, JPG, PDF.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Archivo demasiado grande: ${file.name} (Max: 5MB).`;
    }
    return null; // No hay error
  };

  const handleFileSelect = useCallback((files) => {
    if (!files || files.length === 0) {
        setSelectedFile(null);
        setFileError("");
        return;
    }
    // Solo procesar el primer archivo si se seleccionan varios
    const file = files[0];
    const error = validateFile(file);

    if (error) {
      setFileError(error);
      setSelectedFile(null); // Limpiar selección en caso de error
    } else {
      setFileError(""); // Limpiar errores previos si el archivo es válido
      setSelectedFile(file); // Establecer el archivo válido
    }
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]); // Depende de handleFileSelect

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files);
    // Limpiar el valor del input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = null;
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(""); // Limpiar error asociado al archivo
  };

  // --- Envío de Mensaje ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    // Validar si hay contenido de texto O un archivo seleccionado
    if (!trimmedMessage && !selectedFile) {
      console.warn("Intento de enviar mensaje vacío sin archivo.");
      return; // No enviar si está vacío
    }

    // Llamar a la función onSendMessage proporcionada por el padre
    // Pasar el contenido del mensaje y el archivo seleccionado (en un array para consistencia con la firma original)
    try {
        // onSendMessage es una función async, esperar a que termine
        await onSendMessage(trimmedMessage, selectedFile ? [selectedFile] : []);

        // Limpiar el input y los archivos seleccionados SOLO si el envío fue exitoso
        setMessage("");
        setSelectedFile(null);
        setFileError("");
        // Resetear altura del textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    } catch (error) {
        // El error ya se maneja y notifica en el componente padre (ChatContainer)
        console.error("Error handled in parent:", error);
    }
  };

  // Determinar el texto del placeholder basado en el estado de conexión
  const getPlaceholderText = () => {
      if (connectionError) return "Error de conexión...";
      if (isConnecting) return "Conectando al chat...";
      if (!isConnected) return "Chat desconectado. Intentando reconectar...";
      return "Escribe tu mensaje...";
  };

  // Determinar si el input y el botón de envío deben estar deshabilitados
  const isInputDisabled = !isConnected || !!connectionError || isConnecting;
  const isSendButtonDisabled = isInputDisabled || (!message.trim() && !selectedFile);

    // --- Función para Manejar la Descarga de Adjuntos con Autenticación ---
  const handleDownloadAttachment = useCallback(
    async (attachmentUrl, attachmentFilename) => {
      const token = getAuthToken();
      console.log("Token:", token);
      

      const baseUrl = "http://localhost:8080"; // Ajusta si es necesario

      try {
        const response = await fetch(`${baseUrl}${attachmentUrl}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error al descargar el archivo:", response.status, errorText);
          // toast.error(`Error al descargar: ${response.statusText}`);
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = attachmentFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); // Limpiar el elemento <a>
        window.URL.revokeObjectURL(url); // Liberar el objeto URL
      } catch (error) {
        console.error("Fallo en la descarga del adjunto:", error);
        // toast.error("No se pudo descargar el archivo. Inténtelo de nuevo.");
      }
    },
    []
  ); 

  // --- Render Logic ---
  return (
    <div className="flex-1 flex flex-col h-[600px] lg:h-full max-h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"> {/* Altura ajustada */}
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <FaComments className="text-indigo-600 mr-3 text-xl" />
          <h2 className="text-lg font-semibold text-gray-800">
            Mensajes del Ticket
          </h2>
        </div>
        {/* Indicador de Estado de Conexión */}
        <div className="flex items-center text-xs">
          {connectionError ? (
            <FaExclamationCircle className="text-red-500 mr-1" title={`Error: ${connectionError}`} />
          ) : isConnecting ? (
            <FaSpinner className="animate-spin text-yellow-500 mr-1" title="Conectando..." />
          ) : isConnected ? (
            <span className="w-3 h-3 bg-green-500 rounded-full mr-1" title="Conectado"></span>
          ) : (
            <span className="w-3 h-3 bg-gray-400 rounded-full mr-1" title="Desconectado"></span>
          )}
          <span
            className={`font-medium ${
              connectionError ? "text-red-600" :
              isConnecting ? "text-yellow-600" :
              isConnected ? "text-green-600" : "text-gray-500"
            }`}
          >
            {connectionError ? "Error" : isConnecting ? "Conectando" : isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-100 space-y-3"> {/* Padding/espaciado ajustado */}
        {isLoadingMessages ? (
          <div className="text-center text-gray-500 py-10">
            <FaSpinner className="animate-spin h-6 w-6 mx-auto mb-2 text-indigo-500" />
            Cargando mensajes...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 italic py-10">
            No hay mensajes aún. ¡Sé el primero en escribir!
          </div>
        ) : (
          messages.map((msg) => {
            // console.log("Rendering message:", msg); // Log para depuración
            // Asegurarse de que msg y msg.sender existan antes de acceder a propiedades
            const senderId = msg.sender?.id;
            const senderName = msg.sender?.nombre || msg.sender?.nombres || "Usuario Desconocido"; // Verificar 'nombre' y 'nombres'
            const isSender = senderId === currentUserId;

            // Validación básica para mensajes con estructura mínima
            if (msg.id === undefined || msg.id === null || msg.timestamp === undefined || msg.timestamp === null) {
                console.warn("Saltando renderizado de mensaje con ID o timestamp faltante:", msg);
                return null; // No renderizar mensajes inválidos
            }

            return (
              <div
                key={msg.id} // Usar ID garantizado
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] m-1 p-2 px-3 rounded-lg shadow-sm ${ // Padding ajustado
                    isSender
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {!isSender && ( // Mostrar nombre del remitente solo para mensajes de otros
                    <p className="text-xs font-semibold mb-1 text-indigo-700">
                      {senderName}
                    </p>
                  )}

                  {/* Renderizar contenido basado en el tipo de mensaje */}
                  {/* Mostrar contenido de texto si existe, incluso si hay adjunto */}
                  {msg.content && (
                     <p className={`text-sm whitespace-pre-wrap break-words ${msg.messageType !== "TEXT" ? 'italic text-gray-200' : ''}`}>{msg.content}</p>
                  )}

                  {/* Mostrar información del adjunto si no es solo texto */}
                  {msg.messageType !== "TEXT" && msg.attachmentFilename && (
                    <div className="mt-1 p-2 bg-black bg-opacity-10 rounded text-xs flex items-center gap-2">
                      <FaFileUpload className="flex-shrink-0 text-base" />
                      <span className="truncate flex-1">{msg.attachmentFilename}</span>
                      {/* Añadir enlace de descarga si la URL existe */}
                      {msg.attachmentUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que el clic se propague
                            handleDownloadAttachment(msg.attachmentUrl, msg.attachmentFilename);
                          }}
                          className="p-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                          title={`Descargar ${msg.attachmentFilename}`}
                        >
                        <FaDownload className="text-sm" />
                        </button>
                      )}
                    </div>
                  )}


                  <p
                    className={`text-[10px] mt-1 ${ // Timestamp más pequeño
                      isSender ? "text-indigo-100" : "text-gray-400"
                    } text-right`}
                  >
                    {formatChatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> {/* Ancla para el scroll */}
      </div>

      {/* Área de Entrada */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 bg-gray-50"
      >
        {/* Previsualización de Archivo Seleccionado (Un solo archivo) */}
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between border rounded p-1.5 bg-indigo-50 border-indigo-200">
             <div className="flex items-center gap-2 text-xs text-indigo-800 flex-1 min-w-0">
                <FaFileUpload className="flex-shrink-0 text-indigo-600"/>
                <span className="truncate">
                  {selectedFile.name}
                </span>
             </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 font-bold text-lg leading-none p-1 flex-shrink-0"
              aria-label="Eliminar archivo"
            >
              <FaTimes size={12}/>
            </button>
          </div>
        )}

        {/* Fila de Input */}
        <div className="flex items-end gap-2">
          {/* Botón de Subida de Archivo / Dropzone */}
          <div
            className={`relative flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-lg border-2 border-dashed cursor-pointer transition-colors
              ${ isDragging ? "border-indigo-500 bg-indigo-100" : "border-gray-300 hover:border-indigo-400" }
              ${ fileError ? "border-red-500 bg-red-50" : "" }
              ${ isInputDisabled ? "opacity-50 cursor-not-allowed" : "" }`} // Deshabilitar visualmente
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            // Deshabilitar el clic si el input está deshabilitado
            onClick={() => !isInputDisabled && fileInputRef.current?.click()}
            role="button"
            tabIndex={ isInputDisabled ? -1 : 0} // Remover del orden de tabulación si está deshabilitado
            aria-label="Adjuntar archivo"
            title={ fileError ? fileError : "Adjuntar archivo (PNG, JPG, PDF - Max 5MB)"}
          >
            <FaFileUpload
              className={`text-lg ${ isDragging ? "text-indigo-600" : fileError ? "text-red-500" : "text-gray-500" }`}
            />
            <input
              ref={fileInputRef}
              type="file"
              // Eliminado 'multiple' para manejar un solo archivo
              onChange={handleFileChange}
              className="hidden"
              accept={ALLOWED_TYPES.join(",")} // Usar tipos definidos
              aria-hidden="true"
              disabled={isInputDisabled} // Deshabilitar input
            />
          </div>

          {/* Input de Texto */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholderText()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none overflow-y-auto text-sm" // Eliminado max-h, usando JS resize
            aria-label="Escribir mensaje"
            disabled={isInputDisabled} // Deshabilitar basado en conexión
            onKeyDown={(e) => {
              // Enviar al presionar Enter (sin Shift), nueva línea con Shift+Enter
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevenir salto de línea por defecto
                if (!isSendButtonDisabled) { // Solo enviar si el botón no está deshabilitado
                    handleSubmit(e); // Disparar el envío del formulario
                }
              }
            }}
            style={{ minHeight: "40px", height: "40px" }} // Altura inicial
          />

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isSendButtonDisabled}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Enviar mensaje"
          >
            <FaPaperPlane className="text-lg" />
          </button>
        </div>

        {/* Mensajes de Error */}
        {fileError && !connectionError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
        {connectionError && (
          <p className="mt-1 text-xs text-red-600">
            Error de conexión: {connectionError}
          </p>
        )}

        {/* Texto de Ayuda (Opcional) */}
        {!fileError && !connectionError && (
          <p className="mt-1 text-xs text-gray-500">
            Shift+Enter para nueva línea. Archivo: PNG, JPG, PDF (Max 5MB).
          </p>
        )}
      </form>
    </div>
  );
};

export default ChatComponent;