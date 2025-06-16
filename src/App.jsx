import React from "react";
import MicrosoftSignUp from "./components/MicrosoftAuth/SignupButton";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import UsersComponent from "./components/Users/UsersComponent";
import TaskDetails from "./pages/Helpdesk/TaskDetails";
import SharedFile from "./pages/Knowledge/SharedFile";
import Repository from "./pages/Knowledge/Repository";
import AdminTools from "./pages/Knowledge/AdminTools";
import ProtectedRoute from "./pages/ProtectedRoute";
import { Transition } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import People from "./pages/Knowledge/People";
import MyFile from "./pages/Knowledge/MyFile";
import Sites from "./pages/Knowledge/Sites";
import Sidebar from "./components/Sidebar";
import Tasks from "./pages/Helpdesk/Tasks";
import Trash from "./pages/Helpdesk/Trash";
import Users from "./pages/Helpdesk/Users";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Knowledge/Home";
import Task from "./pages/Knowledge/Task";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import  Eliminados  from "./pages/Knowledge/Eliminados";
import { Toaster } from "sonner";
import { Incidencias } from "./pages/Helpdesk/Incidencias";
import { Departamentos } from "./pages/Helpdesk/Departamentos";
import { Motivos } from "./pages/Helpdesk/Motivos";
import { Logs } from "./pages/Helpdesk/Logs";
import { Prioridades } from "./pages/Helpdesk/Prioridades";
import { AddDepartamento } from "./components/Generic/AddDepartamento";
import { AddPrioridad } from "./components/Generic/AddPrioridades";
import { AddMotivo } from "./components/Generic/AddMotivos";
import { AddIncidencia } from "./components/Generic/AddIncidencias";
import {UsuariosGH} from "./pages/Knowledge/Users"; 
import Perfil from "./components/Users/Perfil";
import { ListedUsers } from "./components/Users/ListUsers";

function Layout() {
  const isAuthenticated = localStorage.getItem("authToken");
  const { pathname } = useLocation();
  const isDashboard = pathname === "/dashboard";

  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className="min-h-screen flex flex-col"
    >
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar condicional */}
        {isAuthenticated !== null && !isDashboard && (
          <div className="hidden md:block sticky top-0 h-[calc(100vh)]">
            <Sidebar />
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto pt-2 pb-0 p-3 2xl:px-10">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </Transition>
  );
}

function App() {
  return (
    <main className="w-full min-h-screen bg-[#e7ebf3]">
      <Routes>
        <Route index path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rutas públicas o que manejan su propia lógica de autenticación (como Dashboard) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<MicrosoftSignUp />} />
        </Route>

        {/* Rutas protegidas generales (Helpdesk, Knowledge) */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "ROLE_ADMIN",
                "ROLE_SUPERVISOR",
                "ROLE_AGENT",
                "ROLE_USER",
              ]}
            />
          }
        >
          <Route element={<Layout />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/helpdesk/tasks" element={<Tasks />} />
            <Route path="/helpdesk/mytickets" element={<Tasks userTicketsOnly={true}/>} />
            <Route path="/helpdesk/completados/:estado" element={<Tasks />} />
            <Route path="/helpdesk/en-proceso/:estado" element={<Tasks />} />
            <Route path="/helpdesk/task/:id" element={<TaskDetails />} />
            <Route path="/helpdesk/trash" element={<Trash />} />
            <Route path="/knowledge/home" element={<Home />} />
            <Route path="/knowledge/myfile" element={<MyFile />} />
            <Route path="/knowledge/sharedfile" element={<SharedFile />} />
            <Route path="/knowledge/sites" element={<Sites />} />
            <Route path="/knowledge/task" element={<Task />} />
            <Route path="/knowledge/people" element={<People />} />
            <Route path="/knowledge/repository" element={<Repository />} />
            <Route path="/knowledge/eliminados" element={<Eliminados />}/>
          </Route>
        </Route>

        {/* Rutas protegidas específicas para Administradores */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route element={<Layout />}>
            <Route path="/admin/helpdesk/users/add-user" element={<UsersComponent/>} />
            <Route path="/admin/knowledge/edit-user/:id" element={<UsersComponent modulo={2}/>} />
            <Route path="/admin/edit-user/:id" element={<UsersComponent modulo={1}/>} />
            <Route
              path="/admin/helpdesk/incidencias"
              element={<Incidencias />}
            />
            <Route
              path="/admin/helpdesk/departamentos"
              element={<Departamentos />}
            />
            <Route
              path="/admin/helpdesk/prioridades"
              element={<Prioridades />}
            />
            <Route path="/admin/helpdesk/motivos" element={<Motivos />} />
            <Route path="/admin/usuarios/logs" element={<Logs />} />
            <Route path="/knowledge/admintools" element={<AdminTools />} />{" "}
            <Route
              path="/admin/helpdesk/departamentos/nuevo"
              element={<AddDepartamento />}
            />
            <Route
              path="/admin/helpdesk/incidencias/nuevo"
              element={<AddIncidencia />}
            />
            <Route
              path="/admin/helpdesk/motivos/nuevo"
              element={<AddMotivo />}
            />
            <Route
              path="/admin/helpdesk/prioridades/nuevo"
              element={<AddPrioridad />}
            />
            <Route
              path="/admin/usuarios/todos"
              element={<Users /> /* Componente para gestionar usuarios */ }
            ></Route>
            {/* Ejemplo: si es solo para admin */}
          </Route>
        </Route>

        {/* Ruta NotFound general */}
        {/* Es buena idea que NotFound también use el Layout si quieres mantener la UI */}
        <Route element={<Layout />}>
          <Route path="/notfound" element={<NotFound />} />
        </Route>
        {/* Captura todas las demás rutas y redirige a /notfound */}
        <Route path="*" element={<Navigate to="/notfound" replace />} />
      </Routes>
      <Toaster />
    </main>
  );
}
export default App;
