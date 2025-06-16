import React from "react";
import "../styles/index.css";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { TbBulb } from "react-icons/tb";
import { LiaUserAstronautSolid } from "react-icons/lia";
import { Button, Transition } from "@headlessui/react";
import { 
  FaRegHandPeace, 
  FaUserPlus, 
  FaSignInAlt, 
  FaSync,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { UseLoginHandler } from "../components/MicrosoftAuth/ButtonHandler";
import { useEffect, useState } from "react";
import CreateTicket from "../components/Ticket/CreateTicket";
import { getUserId } from "../services/UsuarioService";
import { listTicketsByUser } from "../services/TicketService";

const Dashboard = () => {
  return (
    <>
      <div className="App">
        <AuthenticatedTemplate>
          <ProfileContent />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <AuthPrompt />
        </UnauthenticatedTemplate>
      </div>
    </>
  );
};

const AuthPrompt = () => {
  const { handleLogin, valor } = UseLoginHandler();
  console.log(valor);
  
  return (
    <>
      <Transition
        as="div"
        appear
        show
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden space-y-4 p-2"
      >
        <div className="flex items-center space-x-2 text-primary-600">
          <FaRegHandPeace className="w-6 h-6 flex-shrink-0" />
          <h2 className="text-2xl font-bold">
            ¡Bienvenido a nuestra plataforma!
          </h2>
        </div>
        <p className="text-gray-600">
          ¡Gestiona los tickets de soporte y accede a todos nuestros recursos!
        </p>

        <div className="space-y-3">
          <Link
            to="/signup"
            className="mb-4 text-decoration-none flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors group"
          >
            <FaUserPlus className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            <span className="p-2 font-medium text-gray-700 group-hover:text-primary-700">
              Crear nueva cuenta
            </span>
          </Link>

          <Link
            onClick={handleLogin}
            className="mb-4 text-decoration-none flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors group"
          >
            <FaSignInAlt className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
            <span className="p-2 font-medium text-gray-700 group-hover:text-primary-700">
              Acceder a mi cuenta
            </span>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          ¿Necesitas ayuda?{" "}
          <Link
            to="/help"
            className="text-decoration-none text-primary-600 hover:text-primary-700 underline"
          >
            Consulta nuestra guía rápida
          </Link>
        </p>
      </Transition>
    </>
  );
};

const ProfileContent = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  const { accounts } = useMsal();
  const userEmail = accounts[0]?.username || '';

  // Función para obtener los tickets del usuario con paginación
  const fetchUserTickets = async (page = currentPage, size = itemsPerPage) => {
    try {
      setLoading(true);
      const responseUser = await getUserId(userEmail);
      const userId = responseUser.data;
      const response = await listTicketsByUser(userId, page, "",size);
      console.log(response.data);
      
      setTickets(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener tickets al cargar el componente
  useEffect(() => {
    fetchUserTickets();
  }, []);

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      fetchUserTickets(newPage, itemsPerPage);
    }
  };

  // Función para cambiar el número de elementos por página
  const handleItemsPerPageChange = (e) => {
    const newSize = parseInt(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(0); // Volver a la primera página
    fetchUserTickets(0, newSize);
  };

  // Función para obtener la etiqueta de prioridad
  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 1: return 'Alta';
      case 2: return 'Media';
      case 3: return 'Baja';
      default: return 'Desconocida';
    }
  };

  // Función para obtener la etiqueta de estado
  const getStatusLabel = (status) => {
    switch(status) {
      case 1: return 'En Proceso';
      case 2: return 'Cerrado';
      default: return status;
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="flex flex-row justify-content-evenly items-center">
        <div className="flex w-96 bg-blue-950 m-2 p-1 justify-center rounded-full"></div>
        <div className="flex w-96 bg-blue-950 m-2 p-1 justify-center rounded-full"></div>
      </div>

      <div className="flex flex-row justify-content-evenly items-center flex-wrap">
        <Button
          onClick={() => setOpenDialog(true)}
          className="flex w-96 min-h-30 h-fit bg-white m-2 p-1 justify-center rounded text-decoration-none text-black hover:shadow-md transition-shadow"
        >
          <div className="flex flex-row w-90 row-auto">
            <div className="row-1 mt-auto mb-auto">
              <LiaUserAstronautSolid className="fs-1 text-blue-600" />
            </div>
            <div className="row-2 p-1">
              <h4 className="text-lg font-semibold">Generar ticket</h4>
              <div className="border-l-blue-900 border-l-3 p-1 text-sm">
                Describe tu problema rellenando el formulario de soporte.
              </div>
            </div>
          </div>
        </Button>
        
        <a
          href="/knowledge/home"
          className="flex w-96 min-h-30 h-fit bg-white m-2 p-1 justify-center rounded text-decoration-none text-black hover:shadow-md transition-shadow"
        >
          <div className="flex flex-row w-90 ">
            <div className="row-1 mt-auto mb-auto">
              <TbBulb className="fs-1 text-yellow-500" />
            </div>
            <div className="row-2 p-1">
              <h4 className="text-lg font-semibold">Base de conocimientos</h4>
              <div className="border-l-blue-900 border-l-3 p-1 text-sm">
                Encuentra soluciones a problemas comunes.
              </div>
            </div>
          </div>
        </a>
        
        <CreateTicket 
          open={openDialog} 
          setOpen={setOpenDialog} 
          onTicketCreated={() => fetchUserTickets(currentPage, itemsPerPage)} 
        />
      </div>

      {/* SECCIÓN DE TICKETS DEL USUARIO */}
      <div className="mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Mis Tickets</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded px-2 py-1 text-sm"
                disabled={loading}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <button 
              onClick={() => fetchUserTickets(currentPage, itemsPerPage)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              disabled={loading}
            >
              <FaSync className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No has creado ningún ticket aún</p>
            <Button
              onClick={() => setOpenDialog(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Crear mi primer ticket
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Título</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha de creación</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha de expiración</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-600">#{ticket.id}</td>
                      <td className="py-3 px-4">
                        <Link 
                          to={`/helpdesk/task/${ticket.id}`} 
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-decoration-none"
                        >
                          {ticket.tema}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.estado === 1 ? 'bg-yellow-100 text-yellow-800' :
                          ticket.estado === 2 ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getStatusLabel(ticket.estado)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(ticket.fechaCreacion)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(ticket.fechaVencimiento)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.prioridad === 1 ? 'bg-red-100 text-red-800' :
                          ticket.prioridad === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getPriorityLabel(ticket.prioridad)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                Mostrando {Math.min(itemsPerPage, tickets.length)} de {totalItems} tickets
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-2 rounded ${
                    currentPage === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaChevronLeft />
                </button>
                
                <div className="flex space-x-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageIndex = Math.max(
                      0, 
                      Math.min(
                        totalPages - 5, 
                        currentPage - 2
                      )
                    ) + i;
                    
                    if (pageIndex < totalPages) {
                      return (
                        <button
                          key={pageIndex}
                          onClick={() => handlePageChange(pageIndex)}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageIndex
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageIndex + 1}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-2 rounded ${
                    currentPage >= totalPages - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
        <div className="m-4"></div>
      </div>
    </>
  );
};

export default Dashboard;