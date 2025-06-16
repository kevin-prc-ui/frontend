import React from "react";
import {
  FaHome,
  FaFileAlt,
  FaFolderOpen,
  FaGlobe,
  FaTasks,
  FaUsers,
  FaTrashAlt,
} from "react-icons/fa";
import {
  MdSupportAgent,
  MdTaskAlt,
  MdOutlinePendingActions,
  MdSettings,
} from "react-icons/md";
import { PiFolderSimpleUser } from "react-icons/pi";
import { MdAdminPanelSettings } from "react-icons/md";
import { BiDetail } from "react-icons/bi";
import { BsFillPassFill } from "react-icons/bs";


const linkData = [
  {
    label: "Helpdesk",
    icon: <MdSupportAgent />,
    children: [
      {
        label: "Tickets",
        link: "/helpdesk/tasks",
        icon: <FaTasks />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },{
        label: "Mis tickets",
        link: "/helpdesk/mytickets",
        icon: <BsFillPassFill />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "En proceso",
        link: "/helpdesk/en-proceso/en-proceso",
        icon: <MdOutlinePendingActions />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "Completados",
        link: "/helpdesk/completados/completados",
        icon: <MdTaskAlt />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
      {
        label: "Eliminados",
        link: "/helpdesk/trash",
        icon: <FaTrashAlt />,
        roles: ["ROLE_ADMIN", "ROLE_AGENT", "ROLE_SUPERVISOR"],
      },
    ],
  },
  {
    label: "Knowledge Base",
    icon: <PiFolderSimpleUser />,
    children: [
      {
        label: "Inicio",
        link: "/knowledge/home",
        icon: <FaHome />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      {
        label: "Mis Archivos",
        link: "/knowledge/myfile",
        icon: <FaFileAlt />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      // {
      //   label: "Archivo Compartido",
      //   link: "/knowledge/sharedfile",
      //   icon: <FaFolderOpen />,
      //   roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      // },
      {
        label: "Sitios",
        link: "/knowledge/sites",
        icon: <FaGlobe />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      {
        label: "Tareas",
        link: "/knowledge/task",
        icon: <FaTasks />,
        roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      },
      // {
      //   label: "Personas",
      //   link: "/knowledge/people",
      //   icon: <FaUsers />,
      //   roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      // },
      // {
      //   label: "Repositorio",
      //   link: "/knowledge/repository",
      //   icon: <FaDatabase />,
      //   roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPERVISOR"],
      // },
      {
          label: "Eliminados",
          link: "/knowledge/eliminados",
          icon: <FaTrashAlt/>,
          roles: ["ROLE_ADMIN", "ROLE_SUPERVISOR"],
      },
    ],
  },
  {
    label: "Administración",
    icon: <MdAdminPanelSettings />,
    children: [
      {
        label: "Helpdesk",
        icon: <MdSupportAgent />,
        children: [ 
          {
            label: "Departamentos",
            link: "/admin/helpdesk/departamentos",
            icon: <FaFolderOpen />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Prioridades",
            link: "/admin/helpdesk/prioridades",
            icon: <MdOutlinePendingActions />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Motivos",
            link: "/admin/helpdesk/motivos",
            icon: <BiDetail />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Incidencias",
            link: "/admin/helpdesk/incidencias",
            icon: <FaFileAlt />,
            roles: ["ROLE_ADMIN"]
          },
          
        ]
      },
      {
        label: "Usuarios",
        icon: <PiFolderSimpleUser />,  
        children: [ 
          {
            label: "Todos",
            link: "/admin/usuarios/todos",
            icon: <FaUsers />,
            roles: ["ROLE_ADMIN"]
          },
          {
            label: "Logs",
            link: "/admin/usuarios/logs",
            icon: <MdSettings />,
            roles: ["ROLE_ADMIN"]
          }
        ]
      }
    ],
  },
];
export default linkData;
