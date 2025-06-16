import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserRoles } from "../services/UsuarioService";
import {LoadingSpinner} from "./LoadingSpinner"; // Componente de carga personalizado
import { jwtDecode } from 'jwt-decode';
import React from "react";

/**
 * Componente de ruta protegida que verifica autenticación y roles de usuario
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string[]} [props.allowedRoles=[]] - Roles permitidos para acceder a la ruta
 * @returns {JSX.Element} Elemento JSX que renderiza la ruta protegida o redirección
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const isAuthenticated = localStorage?.getItem("authToken");
  const location = useLocation();
  const [state, setState] = useState({
    isLoading: true,
    roles: [],
    error: null
  });
  const accessToken = localStorage.getItem("authToken");
  const decoded = jwtDecode(accessToken).sub;
  
  useEffect(() => {
    let isMounted = true;
    const fetchAuthData = async () => {
      try {
        if (!isAuthenticated) {
          return isMounted && setState(s => ({ ...s, isLoading: false }));
        }
        const roles = (await getUserRoles(decoded)).data;
        if (isMounted) {
          setState({ isLoading: false, roles, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({ isLoading: false, roles: [], error: error.message });
          console.error("Error fetching user roles:", error);
        }
      }
    };

    fetchAuthData();

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // Estado de carga
  if (state.isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>;
  }

  // Manejo de errores
  if (state.error) {
    return <div className="error-page">
      <h2>Error de autenticación</h2>
      <p>{state.error}</p>
    </div>;
  }

  // Usuario no autenticado
  if (!isAuthenticated) {
    return <Navigate 
      to="/login" 
      state={{ from: location }} 
      replace 
    />;
  }

  // Verificación de roles
  const hasRequiredRole = allowedRoles.length === 0 || 
    allowedRoles.some(role => state.roles.includes(role));
  return hasRequiredRole ? (
    <Outlet />
  ) : (
    <Navigate 
      to="/notfound" 
      state={{ from: location }} 
      replace 
    />
  );
};



export default ProtectedRoute;
