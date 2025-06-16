import { useState, useMemo } from "react";
import { MdSettings } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { Container, Nav, Navbar, Button, Spinner } from "react-bootstrap";
import PropTypes from 'prop-types';
import linkData from "../../assets/routes";
import { useUserRoles } from "../../hooks/useUserRoles";
import React from 'react'
import { FaUser } from "react-icons/fa";


const Sidebar = () => {
  const { roles, isLoading, error } = useUserRoles();
  const [expandedParents, setExpandedParents] = useState({});
  const location = useLocation();

  const filteredLinkData = useMemo(() => {
    if (isLoading || error) return [];

    const filterItems = (items) => {
      return items
        .map(item => {
          const filteredItem = { ...item };

          if (item.children) {
            filteredItem.children = filterItems(item.children);
          }

          return filteredItem;
        })
        .filter(item => {
          const hasRequiredRoles = !item.roles || item.roles.length === 0 || item.roles.some(role => roles.includes(role));          
          const hasVisibleChildren = item.children && item.children.length > 0;
          const isLink = !!item.link;
          return hasRequiredRoles && (hasVisibleChildren || isLink);
        });
    };

    return filterItems(linkData);
  }, [roles, isLoading, error]);

  // Manejar expansión de menús
  const toggleParent = (label, depth) => {
    const key = `${depth}-${label}`;
    setExpandedParents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Verificar si un menú está expandido
  const isExpanded = (label, depth) => {
    return !!expandedParents[`${depth}-${label}`];
  };

  // Verificar si un ítem o sus hijos están activos
  const isItemActive = (item) => {
    if (item.link && location.pathname.startsWith(item.link)) {
      return true;
    }

    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }

    return false;
  };

  // Componente recursivo para ítems de menú
  const MenuItem = ({ item, depth = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.label, depth);
    const active = isItemActive(item);
    const key = `${depth}-${item.label}`;

    return (
      <div className="w-100 mb-1">
        {/* Elemento principal - puede ser enlace o botón */}
        {item.link && !hasChildren ? (
          <Link
            to={item.link}
            className={clsx(
              "sidebar-parent-button",
              "w-100 d-flex gap-2 px-3 py-2 rounded align-items-center",
              "text-decoration-none mb-1 text-start",
              depth === 0 ? "text-dark fw-medium" : "text-dark",
              active && "active"
            )}
            style={{ paddingLeft: `${1 + depth}rem` }}
          >
            {item.icon && <span className="fs-5">{item.icon}</span>}
            <span className="fs-6">{item.label}</span>
          </Link>
        ) : (
          <Button
            variant="link"
            className={clsx(
              "sidebar-parent-button",
              "w-100 d-flex gap-2 px-3 py-2 rounded align-items-center",
              "text-decoration-none mb-1 text-start",
              depth === 0 ? "text-dark fw-medium" : "text-dark",
              active && "active"
            )}
            onClick={() => toggleParent(item.label, depth)}
            aria-expanded={expanded}
            aria-controls={`submenu-${key}`}
            style={{ paddingLeft: `${1 + depth}rem` }}
          >
            {item.icon && <span className="fs-5">{item.icon}</span>}
            <span className="fs-6">{item.label}</span>
            {hasChildren && (
              <span className="ms-auto transition-transform">
                {expanded ? '⮝' : '⮟'}
              </span>
            )}
          </Button>
        )}

        {/* Submenús con animación */}
        {hasChildren && (
          <div
            id={`submenu-${key}`}
            className={clsx(
              "child-links",
              expanded ? "child-links-expanded" : "child-links-collapsed"
            )}
            style={{
              paddingLeft: `${depth}rem`
            }}
            role="menu"
            aria-hidden={!expanded}
          >
            {item.children.map((child) => (
              <MenuItem
                key={`${depth + 1}-${child.label}`}
                item={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container fluid className="h-100 p-3 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="h-100 p-3 bg-light border-end sidebar-container">
      <Navbar expand="lg" className="flex-column h-100 align-items-stretch">
        <Nav className="flex-column flex-grow-1 w-100">
          {filteredLinkData.length === 0 && !isLoading && (
            <p className="text-muted text-center mt-3">No hay opciones de menú disponibles.</p>
          )}

          {filteredLinkData.map((parent) => (
            <MenuItem key={`0-${parent.label}`} item={parent} depth={0} />
          ))}

          <div className="w-100 border-top pt-3 mt-auto">
            <SettingsButton isActive={location.pathname.startsWith('/perfil')} />
          </div>
        </Nav>
      </Navbar>
    </Container>
  );
};

// SettingsButton (sin cambios)
const SettingsButton = ({ isActive }) => (
  <Button
    variant="link"
    className={clsx(
      "settings-button",
      "text-dark d-flex align-items-center gap-2 w-100 px-3 py-2 rounded",
      "text-decoration-none",
      isActive && "active"
    )}
    as={Link}
    to="/perfil"
  >
    <FaUser className="fs-5" />
    <span className="fs-6 fw-medium">Perfil</span>
  </Button>
);

SettingsButton.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default Sidebar;