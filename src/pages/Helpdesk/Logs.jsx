import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { FaSearch, FaCalendarAlt, FaUser, FaEnvelope } from "react-icons/fa";
import { listAllIps } from "../../services/IpService";

export const Logs = () => {
  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("nombre"); // 'nombre' o 'email'
  const itemsPerPage = 8;

  useEffect(() => {
    fetchIps();
  }, []);

  const fetchIps = async () => {
    try {
      setLoading(true);
      const response = await listAllIps();
      setIps(response.data);
    } catch (err) {
      setError("Error al cargar registros de acceso");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setCurrentPage(1);
  };

  // Función para formatear fechas de forma amigable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    
    // Comprobar si es hoy
    if (date.toDateString() === today.toDateString()) {
      return `Hoy a las ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Comprobar si es ayer
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer a las ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Formato para fechas anteriores
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar ips basado en el término de búsqueda y tipo
  const filteredIps = ips.filter((ip) => {
    const term = searchTerm.toLowerCase();
    
    if (searchType === "email") {
      const usuarioEmail = ip.usuarioEmail ? String(ip.usuarioEmail).toLowerCase() : "";
      return usuarioEmail.includes(term);
    } else {
      const nombreUsuario = ip.nombreUsuario ? String(ip.nombreUsuario).toLowerCase() : "";
      return nombreUsuario.includes(term);
    }
  });

  // Calcular ips para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIps.length / itemsPerPage);

  // Generar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    let items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botón "Anterior"
    items.push(
      <button
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        Anterior
      </button>
    );

    // Primera página
    if (startPage > 1) {
      items.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 ${
            1 === currentPage
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        items.push(
          <span key="dots-start" className="px-2 py-1">
            ...
          </span>
        );
      }
    }

    // Páginas visibles
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1 ${
            number === currentPage
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {number}
        </button>
      );
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <span key="dots-end" className="px-2 py-1">
            ...
          </span>
        );
      }
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 ${
            totalPages === currentPage
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    // Botón "Siguiente"
    items.push(
      <button
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        Siguiente
      </button>
    );

    return items;
  };

  if (error) {
    return (
      <div className="bg-white rounded shadow-md p-6 mt-4">
        <div className="text-red-500 font-medium">{error}</div>
        <button
          className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          onClick={fetchIps}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Registros de Acceso</h2>
      </div>
      <div className="bg-white rounded shadow-md overflow-hidden">
        <div className="p-6">
          {/* Recuadro de búsqueda mejorado */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  name="searchIp"
                  id="searchIp"
                  className="p-4 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder={searchType === "email" ? "Buscar por correo..." : "Buscar por nombre..."}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSearchTypeChange("nombre")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    searchType === "nombre"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaUser className="mr-2" />
                  Nombre
                </button>
                <button
                  onClick={() => handleSearchTypeChange("email")}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    searchType === "email"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaEnvelope className="mr-2" />
                  Correo
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Encabezados de la tabla */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded mb-3 font-medium text-gray-600 uppercase text-sm">
                <div className="col-span-2">Dirección IP</div>
                <div className="col-span-3">Nombre</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Fecha de acceso</div>
              </div>

              {/* Lista de registros */}
              {currentItems.length > 0 ? (
                currentItems.map((ip) => (
                  <div
                    key={ip.id}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-2 text-gray-700 font-mono">{ip.ip}</div>
                    <div className="col-span-3 text-gray-700 font-medium">
                      {ip.nombreUsuario}
                    </div>
                    <div className="col-span-3 text-gray-700">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {ip.usuarioEmail}
                      </div>
                    </div>
                    <div className="col-span-2 text-gray-700">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {formatDate(ip.fechaRegistro)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {searchTerm 
                    ? `No se encontraron registros para "${searchTerm}"` 
                    : "No hay registros de acceso disponibles"}
                </div>
              )}

              {/* Paginación mejorada */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfFirstItem + itemsPerPage, filteredIps.length)} de {filteredIps.length} registros
                  </div>
                  
                  <div className="inline-flex rounded shadow-sm" role="group">
                    {renderPagination()}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Transition>
  );
};