import axios from "axios";
import { toast } from "sonner";

const REST_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the token from localStorage
const token = () => localStorage.getItem("authToken");
// Basic check if token exists and is valid JSON before parsing
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

// Function to create headers with the Authorization token
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

export const listUsers = (departamento) => {
  if (departamento) {
    return axios
      .get(
        `${REST_API_BASE_URL}/users/departamento/${departamento}`,
        getHeaders()
      ) // Add headers to the request
      .then((response) => response)
      .catch((error) => {
        if (!error.response) {
          toast.error("Error de conexión con el servidor");
          throw new Error("Error de conexion con el servidor");
        }
        throw error;
      });
  }

  return axios
    .get(`${REST_API_BASE_URL}/users`, getHeaders()) // Add headers to the request
    .then((response) => response)
    .catch((error) => {
      if (!error.response) {
        toast.error("Error de conexión con el servidor");
        throw new Error("Error de conexion con el servidor");
      }
      throw error;
    });
};

export const signUp = (userData) =>
  axios.post(`${REST_API_BASE_URL}/auth/signup`, userData);

export const getUserById = (userId) =>
  axios.get(`${REST_API_BASE_URL}/users/${userId}`, getHeaders());

export const getUserByEmail = () =>
  axios.get(`${REST_API_BASE_URL}/users/me/email`, getHeaders());

export const updateUser = (userId, user) =>
  axios.put(`${REST_API_BASE_URL}/users/edit/${userId}`, user, getHeaders());

export const deleteUser = (userId) =>
  axios.delete(`${REST_API_BASE_URL}/users/delete/${userId}`, getHeaders());

export const getUserPermissions = async () => {
  const response = await axios.get(
    `${REST_API_BASE_URL}/users/permisos`,
    getHeaders()
  );
  return response;
};

export const checkOrCreateUser = (userData) =>
  axios.post(
    `${REST_API_BASE_URL}/users/check-or-create`,
    userData,
    getHeaders()
  );

export const login = (loginData) =>
  axios.post(`${REST_API_BASE_URL}/auth/login`, loginData);

export const logout = () =>
  // Corrected: Pass null or {} as data if no body is needed,
  // and getHeaders() as the config (third argument).
  axios.post(`${REST_API_BASE_URL}/auth/logout`, getHeaders());

export const getUserRoles = () => {
  return axios
    .get(`${REST_API_BASE_URL}/users/email/roles`, getHeaders())
    .then((response) => response)
    .catch((error) => {
      if (!error.response) {
        toast.error("Error de conexión con el servidor");
        throw new Error("Error de conexion con el servidor");
      }
      throw error;
    });
};

export const getUserId = () =>
  axios.get(`${REST_API_BASE_URL}/users/me/id`, getHeaders());

export const getPermisos = () =>
  axios.get(`${REST_API_BASE_URL}/users/permisos`, getHeaders());

export const listAllModulos = () =>
  axios.get(`${REST_API_BASE_URL}/modulos`, getHeaders());

export const listAllPermisos = () =>
  axios.get(`${REST_API_BASE_URL}/permisos`, getHeaders());
