import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../services/authConfig";
import { callMsGraph } from "../../graph";
import { toast } from "sonner";
import { signUp, login } from "../../services/UsuarioService";

const MicrosoftSignUp = () => {
  const { instance } = useMsal();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError("");
      localStorage.removeItem("authToken"); // Limpiar token al iniciar el proceso

      // 1. Autenticación con Microsoft
      const response = await instance.loginPopup(loginRequest);
      
      if (!response?.accessToken) {
        throw new Error("No se pudo obtener el token de acceso");
      }

      // 2. Obtener datos del usuario
      const graphResponse = await callMsGraph(response.accessToken);
      
      if (!graphResponse?.userPrincipalName) {
        throw new Error("Datos de usuario incompletos");
      }

      // 3. Crear usuario en tu backend
      const userData = {
        nombre: graphResponse.givenName || "Nombre no proporcionado",
        apellido: graphResponse.surname || "Apellido no proporcionado",
        email: graphResponse.userPrincipalName,
        password: graphResponse.id,
        enabled: true,
        roles: ["ROLE_USER"],
        permisos: [""],
      };

      const loginData = {
        email: graphResponse.userPrincipalName,
        password: graphResponse.id,
      };

      // Intento de registro
      await signUp(userData);
      
      // Si el registro es exitoso, hacer login
      const respuesta = await login(loginData);
      localStorage.setItem("authToken", JSON.stringify(respuesta.data));
      navigate("/dashboard");
      toast.success("Registro exitoso! Redirigiendo...");

    } catch (error) {
      let errorMessage = "Error desconocido";
      
      // Manejo específico de errores
      if (error.response) {
        // Error del backend
        const { status, data } = error.response;
        
        if (status === 401) { // Suponiendo que 409 es el código para conflicto (usuario existente)
          errorMessage = data.mensaje || "El usuario ya existe";
        } else {
          errorMessage = data.mensaje || `Error del servidor (${status})`;
        }
      } else if (error.message) {
        // Errores de Microsoft o de red
        errorMessage = error.message;
      }

      // Mostrar notificación y limpiar estado
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("Error en el registro:", error);

    } finally {
      setIsSigningIn(false);
    }
  };

  // ... (resto del componente igual)
  return (
    <Transition
      appear
      show
      enter="transition-opacity duration-1000"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      >
      <div className="h-45 w-full flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 bg-gray-50 sm:rounded-lg sm:w-full sm:max-w-md">
          <div className="pt-4 pb-4 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6 ">
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              <div>
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Registrarse con Microsoft
                  </h2>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-[#2F2F2F] text-white hover:bg-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005A9E] disabled:opacity-50 transition-colors duration-200"
                >
                  {isSigningIn ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 23 23"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* ICONO DE MICROSOFT, CADA PATH ES UN CUADRO DEL ICONO */}
                      <path d="M11.5 11.5H22V22H11.5V11.5Z" fill="#F25022" />
                      <path d="M11.5 0H22V10.5H11.5V0Z" fill="#7FBA00" />
                      <path d="M0 11.5H10.5V22H0V11.5Z" fill="#00A4EF" />
                      <path d="M0 0H10.5V10.5H0V0Z" fill="#FFB900" />
                    </svg>
                  )}
                  Registrarse ahora!
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Al registrarte, aceptas nuestros{" "}
                <a href="#" className="text-[#005A9E] hover:underline">
                  términos de servicio
                </a>{" "}
                y{" "}
                <a href="#" className="text-[#005A9E] hover:underline">
                  política de privacidad
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default MicrosoftSignUp;
