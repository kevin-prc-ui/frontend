/**
 * Formatea el rol del usuario para mostrar un nombre legible.
 * @param {string} rolId - ID del rol del usuario.
 * @returns {string} Nombre del rol.
 */
export const formatUserRole = (rol) => {
  switch (rol) {
    case "ROLE_ADMIN":
        return "Administrador";
    case 'ROLE_USER':
        return "Usuario";
    case "ROLE_AGENT":
        return "Agente";
    case "ROLE_SUPERVISOR":
        return "Supervisor";
    default:
        return "Desconocido";
    }
};
//retorna lo mismo que la funcion de arriba, solamente que con su respectivo sistema
export const formatUserRoleWithSystem = (rol) => {
  switch (rol) {
    case "ROLE_ADMIN":
        return "Administrador";
    case 'ROLE_USER':
        return "Usuario - Gestión documental";
    case "ROLE_AGENT":
        return "Agente - Mesa de ayuda";
    case "ROLE_SUPERVISOR":
        return "Supervisor - Ambos sistemas";
    default:
        return "Desconocido";
    }
};
  
  /**
   * Constantes que contiene todos los roles de la aplicacion
   */
  // const fetchRoles = await listRol();

  /**
   * Mensaje de error por defecto
   */
  export const DEFAULT_ERROR_MESSAGE = "Error de conexión con el servidor. Intente nuevamente más tarde.";
  
  /**
   * Funcion que se encarga de manejar los errores de la API.
   * @param {*} error - El error que se produjo en la api
   * @param {string} defaultMessage - El mensaje que debe mostrar si el error no viene especificado.
   */
  export const handleApiError = (error, defaultMessage = "An error occurred") => {
    console.error("API error:", error);
    if (error.response && error.response.data) {
      // Show the error from the backend if available
      alert(`${defaultMessage}: ${error.response.data.message || ""}`);
    } else {
      alert(defaultMessage);
    }
  };

  export const getVencimiento = (expirationDate) => {
    
    if (expirationDate) {      
      // 1. Validate Input: Ensure it's a valid Date object
      if (!(expirationDate instanceof Date) || isNaN(expirationDate.getTime())) {
        console.error("getVencimientoStatus received an invalid date:", expirationDate);
        return "Invalid Date";
      }
    
      // 2. Get Current Time
      const now = new Date();
    
      // 3. Calculate Difference in Milliseconds
      //    Positive value means expirationDate is in the future
      //    Negative value means expirationDate is in the past (overdue)
      const diffInMs = expirationDate.getTime() - now.getTime();    
      // 4. Define time units in milliseconds
      const minuteInMs = 60 * 1000;
      const hourInMs = 60 * minuteInMs;
      const dayInMs = 24 * hourInMs;
    
      // 5. Calculate absolute difference for easier unit calculation
      const absDiffInMs = Math.abs(diffInMs);
    
      // 6. Determine the largest relevant unit and format the output string
      if (absDiffInMs >= dayInMs) {
        const dias = Math.floor(absDiffInMs / dayInMs);
        return diffInMs > 0
          ? `Expira en ${dias} dia${dias > 1 ? 's' : ''}`
          : `Expiró hace ${dias} dia${dias > 1 ? 's' : ''}`;
      } else if (absDiffInMs >= hourInMs) {
        const hours = Math.floor(absDiffInMs / hourInMs);
        return diffInMs > 0
          ? `Expira en ${hours} hora${hours > 1 ? 's' : ''}`
          : `Expiró hace ${hours} hora${hours > 1 ? 's' : ''}`;
      } else if (absDiffInMs >= minuteInMs) {
        const minutes = Math.floor(absDiffInMs / minuteInMs);
        return diffInMs > 0
          ? `Expira en ${minutes} minuto${minutes > 1 ? 's' : ''}`
          : `Expiró hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else {
        // Less than a minute difference
        return diffInMs > 0 ? "Expira pronto" : "Expiró hace poco";
      }
    }
  };

  export const formatDate = (date) => {
    
    // Get the month, day, and year
    const year = date.getFullYear();
    const month = String(date.getMonth()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

  
    const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}`;
  
    return formattedDate;
  };
  
  export function dateFormatter(dateString) {
    const inputDate = new Date(dateString);
  
    if (isNaN(inputDate)) {
      return "Invalid Date";
    }
  
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, "0");
    const day = String(inputDate.getDate()).padStart(2, "0");
  
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }
  
  export function getInitials(fullName) {
    const names = fullName.split(" ");
  
    const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());
  
    const initialsStr = initials.join("");
  
    return initialsStr;
  }

  export const getBadgeColor = (statusName) => {
  const lowerStatus = String(statusName ?? "").toLowerCase();
  switch (lowerStatus) {
    case "en-proceso":
      return "bg-yellow-100 text-yellow-800";
    case "completados":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPriorityColor = (priorityName) => {
  const lowerPriority = String(priorityName ?? "").toLowerCase();
  switch (lowerPriority) {
    case "alta":
      return "bg-red-100 text-red-800";
    case "media":
      return "bg-yellow-100 text-yellow-800";
    case "baja":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};  
  
  export const PRIORITYNAMES = {
    1: "Alta",
    2: "Media",
    3: "Baja",
  };
  

  export const PRIOTITYSTYELS = {
    1: "text-red-600",
    2: "text-yellow-600",
    3: "text-blue-600",
  };
  
  export const TICKET_TYPE = {
    1: "bg-yellow-500",
    2: "bg-blue-500",
    3: "bg-yellow-600",
    4: "bg-red-600",
  };
  
  export const BGS = [
    "bg-blue-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-green-600",
  ];
  export const TASK_TYPE = {
    pendiente: "bg-blue-600",
    "en-proceso": "bg-yellow-600", 
    "completados": "bg-green-600", 
  };
  