// c:\react\Proyecto\frontend\src\services\TicketService.js
import axios from "axios";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const token = () => localStorage.getItem("authToken");
const getAuthToken = () => {
  const storedToken = token();
  if (storedToken) {
    try {
      const parsedToken = JSON.parse(storedToken);
      return parsedToken?.accessToken; // Use optional chaining
    } catch (e) {
      console.error("Error parsing auth token from localStorage", e);
      return null; // Handle parsing error
    }
  }
  return null; // Handle case where token doesn't exist
};

const getHeaders = () => {
  const accessToken = getAuthToken();
  if (!accessToken) {
    // Handle case where token is not available, maybe redirect to login or throw error
    console.warn("No access token found for API request.");
    // Depending on your app's logic, you might want to throw an error
    // or return empty headers, which will likely cause the API call to fail (401/403)
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

export const getTicketById = (ticketId) =>
  axios.get(`${REST_API_BASE_URL}/tickets/${ticketId}`, getHeaders());

/**
 * Lists tickets, optionally filtered by department. Fetches all statuses.
 * @param {number} page - The page number (0-indexed).
 * @param {string} [departamento=""] - Optional department ID to filter by.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const listTickets = (page, departamento = "") => {
  // Use URLSearchParams for cleaner query string building
  const params = new URLSearchParams({
    page: page,
    size: 8, // Your desired page size
  });

  // Append departamento only if it has a value
  if (departamento) {
    params.append("departamento", departamento); // Ensure backend expects 'departamento'
  }

  const url = `${REST_API_BASE_URL}/tickets/all?${params.toString()}`;

  return axios.get(url, getHeaders()).catch((error) => {
    if (!error.response) {
      console.error("Network Error or Server Down:", error.message);
      throw new Error("Error de conexión con el servidor");
    }
    console.error("API Error (listTickets):", error.response);
    throw error; // Re-throw the original error for further handling
  });
};

export const listTicketsByUser= (userId, page, departamento="", size=8) =>
  axios.get(`${REST_API_BASE_URL}/tickets/user/${userId}?page=${page}&size=${size}&departamento=${departamento}`, getHeaders());

export const searchTickets= (busqueda) =>
  axios.get(`${REST_API_BASE_URL}/tickets/search?busqueda=${busqueda}`, getHeaders());

/**
 * Lists tickets filtered by status, optionally filtered by department.
 * @param {number} page - The page number (0-indexed).
 * @param {string} status - The status to filter by (e.g., 'pendiente'). Backend expects 'filtro'.
 * @param {string|number} [departamento=""] - Optional department ID to filter by.
 * @returns {Promise<AxiosResponse<any>>}
 */
export const listFilteredTickets = (page, status, departamento = "") => {
  // Use URLSearchParams
  const params = new URLSearchParams({
    page: page,
    size: 8,
    filtro: status, // Backend expects 'filtro' for status
  });

  // Append departamento only if it has a value
  if (departamento) {
    params.append("departamento", departamento); // Ensure backend expects 'departamento'
  }

  const url = `${REST_API_BASE_URL}/tickets?${params.toString()}`;
  return axios.get(url, getHeaders()).catch((error) => {
    if (!error.response) {
      console.error("Network Error or Server Down:", error.message);
      throw new Error("Error de conexión con el servidor");
    }
    console.error("API Error (listFilteredTickets):", error.response);
    throw error; // Re-throw the original error
  });
};

export const listTrashedTickets = (page) => {
  const params = new URLSearchParams({
    page: page,
    size: 8,
  });
  const url = `${REST_API_BASE_URL}/tickets/trashed?${params.toString()}`;
  return axios.get(url, getHeaders()).catch((error) => {
    if (!error.response) {
      console.error("Network Error or Server Down:", error.message);
      throw new Error("Error de conexión con el servidor");
    }
    console.error("API Error (listTrashedTickets):", error.response);
    throw error;
  });
};

export const deleteTicket = (ticketId) =>
  axios.delete(`${REST_API_BASE_URL}/tickets/${ticketId}`, getHeaders());

export const restoreTicket = (ticketId) =>
  //Se envia null debido a que la firma de axios.put es axios.put(url[,data[,config]]).
  //Debemos pasar el header como 3er argumento y no como 2do, mandando null de segundo argumento
  axios.put(
    `${REST_API_BASE_URL}/tickets/restore/${ticketId}`,
    null,
    getHeaders()
  );

// Función para crear un nuevo ticket
export const createTicket = (ticketData) =>
  axios.post(`${REST_API_BASE_URL}/tickets`, ticketData, getHeaders());

export const updateTicket = (id, ticketData) =>
  axios.put(`${REST_API_BASE_URL}/tickets/${id}`, ticketData, getHeaders());

export const updateTicketStatus = (id, estadoId) =>
  axios.put(`${REST_API_BASE_URL}/tickets/status/${id}?estadoId=${estadoId}`, null ,getHeaders());