import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Importar toast
import { FaSearch } from "react-icons/fa"; // Importar icono de búsqueda
import { deleteUser, listUsers } from "../../services/UsuarioService";
import { formatUserRole } from "../../utils/utils";

export const ListedUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const itemsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await listUsers();
      setUsuarios(response.data);
    } catch (err) {
      setError("Error al cargar usuarios");
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
    setCurrentPage(1); // Resetear a la primera página con nueva búsqueda
  };

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsuarios = usuarios.filter((usuario) => {
    const term = searchTerm.toLowerCase();
    // Asegurarse de que los campos existan y convertirlos a string para búsqueda segura
    const nombre = usuario.nombre ? String(usuario.nombre).toLowerCase() : "";
    const apellido = usuario.apellido
      ? String(usuario.apellido).toLowerCase()
      : "";
    const email = usuario.email ? String(usuario.email).toLowerCase() : "";
    // Asumimos que roles y permisos son strings o se pueden convertir a string y buscar
    const roles = usuario.roles ? String(usuario.roles).toLowerCase() : "";
    const permisos = usuario.permisos
      ? String(usuario.permisos).toLowerCase()
      : "";

    return (
      nombre.includes(term) ||
      apellido.includes(term) ||
      email.includes(term) ||
      roles.includes(term) ||
      permisos.includes(term)
    );
  });

  // Calcular usuarios para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsuarios.slice(
    indexOfFirstItem,
    indexOfLastItem
  ); // Usar usuarios filtrados
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage); // Usar longitud de usuarios filtrados

  // Generar paginación
  const renderPagination = () => {
    let items = [];

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

    // Números de página
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <button
          key={number}
          onClick={() => handlePageChange(number)}
          className={`px-3 py-1 ${
            currentPage === number
              ? "bg-blue-500 text-white rounded"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {number}
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

  const deleteHandler = async (userId) => {
    // Confirmación antes de eliminar
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        setLoading(true); // Podrías tener un estado de loading específico para la eliminación si prefieres
        await deleteUser(userId);
        toast.success("Usuario eliminado correctamente");
        fetchUsuarios(); // Recargar la lista de usuarios
      } catch (err) {
        setError("Error al eliminar usuario");
        toast.error("Error al eliminar el usuario");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  if (error) {
    return (
      <div className="bg-white rounded shadow-md p-6 mt-4">
        <div className="text-red-500 font-medium">{error}</div>
        <button
          className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          onClick={fetchUsuarios}
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
        <h2 className="text-xl font-bold text-gray-800">Usuarios</h2>
        <button
          enabled
          className="bg-blue-500 rounded hover:bg-blue-600 text-white font-medium py-2 px-4 transition-colors flex items-center"
          onClick={() => navigate("/admin/helpdesk/users/add-user")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nuevo Usuario
        </button>
      </div>
      <div className="bg-white rounded shadow-md overflow-hidden">
        {/* Header de la tarjeta */}

        {/* Contenido */}
        <div className="p-6">
          {/* Recuadro de búsqueda */}
          <div className="m-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="searchUser"
                id="searchUser"
                className="p-4 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-60 0 rounded-md py-2"
                placeholder="Buscar por nombre, apellido, email, rol o permisos..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
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
                <div className="col-span-2 text-center">Nombre</div>
                <div className="col-span-2 text-center">Apellido</div>
                <div className="col-span-2 text-center">Email</div>
                <div className="col-span-2 text-center">Rol</div>
                <div className="col-span-2 text-center">Depto.</div>
                <div className="col-span-2 text-center">Acciones</div>
              </div>

              {/* Lista de usuarios */}
              {currentItems.length > 0 ? (
                currentItems.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {" "}
                    <div className="col-span-2 text-center text-gray-700">{usuario.nombre}</div>
                    <div className="col-span-2 text-center text-gray-700">
                      {usuario.apellido}
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {usuario.email}
                    </div>
                    <div className="col-span-2 text-center text-gray-700">
                      {formatUserRole(usuario.roles[0])}
                    </div><div className="col-span-2 text-center text-gray-700">
                      {usuario.departamento?.nombre}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 m-1 bg-blue-50 hover:bg-blue-100 rounded p-2 transition-colors"
                        onClick={() =>
                          navigate(`/admin/edit-user/${usuario.id}`)
                        }
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 m-1 bg-red-50 hover:bg-red-100 rounded p-2 transition-colors"
                        onClick={() => deleteHandler(usuario.id)} // Pasar el id del usuario
                        title="Eliminar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
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
                  No se encontraron usuarios
                </div>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
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
