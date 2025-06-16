import React, { useCallback, useEffect, useState } from "react";
import { Button, Alert, Form, Row, Col, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { signUp, getUserById, updateUser, listAllModulos,listAllPermisos } from "../../services/UsuarioService";
import { listAllDepartamentos, } from "../../services/DepartamentoService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { listRol} from "../../services/RolService";
import { formatUserRole, formatUserRoleWithSystem } from "../../utils/utils";

const UsersComponent = (modulo) => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [departamentoId, setDepartamentoId] = useState("");
  const [moduloId, setModuloId] = useState("");
  const [departamentosDisponibles, setDepartamentosDisponibles] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [roles, setRoles] = useState([]);

  // Estado para almacenar los errores de validación
  const [errors, setErrors] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "",
    moduloId: "",
  });

  const { id } = useParams();
  const navigator = useNavigate();
  const [loading, setLoading] = useState(false);

  // Determinar si el módulo seleccionado es GESTIÓN
  const esModuloGestion = modulosDisponibles.some(
    mod => mod.id === parseInt(moduloId) && mod.nombre.toUpperCase() === "GESTION"
  );

  const loadInitialData = useCallback(async () => {
    try {
      const [depRes, rolRes, modRes, prmRes] = await Promise.all([
        listAllDepartamentos(),
        listRol(),
        listAllModulos(),
        listAllPermisos()
      ]);
      
      setDepartamentosDisponibles(depRes.data || []);
      setModulosDisponibles(modRes.data || []);
      setRoles(rolRes.data || []);
      
      const data = prmRes.data;
      const filteredPermisos = data.filter(
        (permiso) => permiso.moduloId === modulo.modulo
      );
      setPermisosDisponibles(filteredPermisos || []);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("Error al cargar datos. Contacte a sistemas.");
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getUserById(id)
        .then((response) => {
          const userData = response.data;
          setNombre(userData.nombre);
          setApellido(userData.apellido);
          setEmail(userData.email);
          setRol(
            userData.roles && userData.roles.length > 0 ? userData.roles[0] : ""
          );
          setDepartamentoId(userData.departamento?.id ? String(userData.departamento.id) : "");
          setModuloId(userData.modulo?.id ? String(userData.modulo.id) : "");
          setSelectedPermisos(userData.permisos || []);
          setIsEnabled(userData.enabled);
        })
        .catch((error) => {
          toast.error("Error al cargar el usuario", error);
        })
        .finally(() => setLoading(false));
    } else {
      setNombre("");
      setApellido("");
      setEmail("");
      setRol("");
      setSelectedPermisos([]);
      setDepartamentoId("");
      setModuloId("");
      setIsEnabled(true);
      setErrors({ nombre: "", apellido: "", email: "", rol: "", moduloId: "" });
    }
  }, [id]);

  const handlePermissionChange = (permisoNombre) => {
    setSelectedPermisos((prev) => {
      if (prev.includes(permisoNombre)) {
        return prev.filter((p) => p !== permisoNombre);
      }
      return [...prev, permisoNombre];
    });
  };

  const saveOrUpdateUser = async (e) => {
    e.preventDefault();
    
    const userData = {
      nombre,
      enabled: isEnabled,
      apellido,
      email,
      roles: rol ? [rol] : [],
      // Si es módulo GESTIÓN, enviar null en permisos
      permisos: esModuloGestion ? null : selectedPermisos,
      departamento: esModuloGestion? null : (departamentoId ? { id: parseInt(departamentoId) } : null),
      modulo: moduloId ? { id: parseInt(moduloId) } : null,
    };

    if (!isFormValid({ nombre, apellido, email, rol, moduloId })) return;

    setLoading(true);
    try {
      if (id) {
        await updateUser(id, userData);
        toast.info("Usuario actualizado correctamente");
      } else {
        await signUp(userData);
        toast.info("Usuario creado correctamente");
      }
      navigator("/admin/usuarios/todos");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error desconocido";
      toast.error(`Error al guardar los cambios del usuario: ${errorMessage}`);
      console.error("Save/Update User Error:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (formData) => {
    let valid = true;
    const newErrors = {
      nombre: "",
      apellido: "",
      email: "",
      rol: "",
      moduloId: "",
    };

    if (!formData.nombre || formData.nombre.trim() === "") {
      newErrors.nombre = "El nombre es obligatorio";
      valid = false;
    }

    if (!formData.apellido || formData.apellido.trim() === "") {
      newErrors.apellido = "El apellido es obligatorio";
      valid = false;
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "El email es obligatorio";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
      valid = false;
    }

    if (!formData.rol || formData.rol.trim() === "") {
      newErrors.rol = "El Rol es obligatorio";
      valid = false;
    }

    if (!formData.moduloId || String(formData.moduloId).trim() === "") {
      newErrors.moduloId = "El modulo es obligatorio";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  function pageTitle() {
    return id ? <h2 className="text-center">Editar usuario</h2> : <h2 className="text-center">Agregar usuario</h2>;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="card col-md-8 col-lg-6">
          <div className="card-header text-center">{pageTitle()}</div>
          <div className="card-body">
            <Form noValidate onSubmit={saveOrUpdateUser}>
              {id && (
                <Form.Group className="mb-4">
                  <Form.Label>Estado del perfil:</Form.Label>
                  <ToggleButtonGroup 
                    type="radio" 
                    name="isEnabled" 
                    value={isEnabled}
                    onChange={(val) => setIsEnabled(val)}
                    className="w-100"
                  >
                    <ToggleButton
                      id="tbg-radio-enabled"
                      value={true}
                      variant={isEnabled ? "success" : "outline-success"}
                      className="d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Perfil activo
                    </ToggleButton>
                    <ToggleButton
                      id="tbg-radio-disabled"
                      value={false}
                      variant={!isEnabled ? "danger" : "outline-danger"}
                      className="d-flex align-items-center justify-content-center"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Perfil inactivo
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Form.Text className="text-muted">
                    {isEnabled 
                      ? "El usuario puede iniciar sesión y usar el sistema" 
                      : "El usuario no podrá iniciar sesión ni usar el sistema"}
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre:</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Ingresa el nombre"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  isInvalid={!!errors.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formApellido">
                <Form.Label>Apellido:</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Ingresa el apellido"
                  name="apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  isInvalid={!!errors.apellido}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.apellido}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Ingresa el Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formRol">
                <Form.Label>Rol:</Form.Label>
                <Form.Select
                  required
                  name="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  isInvalid={!!errors.rol}
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((r) => (
                    <option key={r.nombre} value={r.nombre}>
                      {formatUserRoleWithSystem(r.nombre)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.rol}
                </Form.Control.Feedback>
              </Form.Group>

              {!esModuloGestion && (<Form.Group className="mb-3" controlId="formDepartamento">
                <Form.Label>Departamento:</Form.Label>
                <Form.Select
                  required
                  name="departamentoId"
                  value={departamentoId}
                  onChange={(e) => setDepartamentoId(e.target.value)}
                  isInvalid={!!errors.departamentoId}
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentosDisponibles.map((depto) => (
                    <option key={depto.id} value={depto.id}>
                      {depto.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departamentoId}
                </Form.Control.Feedback>
              </Form.Group>)}

              <Form.Group className="mb-3" controlId="formModulo">
                <Form.Label>Módulo:</Form.Label>
                <Form.Select
                  required
                  name="moduloId"
                  value={moduloId}
                  onChange={(e) => setModuloId(e.target.value)}
                  isInvalid={!!errors.moduloId}
                >
                  <option value="">Seleccione un módulo</option>
                  {modulosDisponibles.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.moduloId}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Mostrar permisos solo si no es módulo GESTIÓN */}
              {!esModuloGestion && (
                <Form.Group className="mb-3">
                  <Form.Label>Permisos:</Form.Label>
                  <Row>
                    {permisosDisponibles.length > 0 ? (
                      permisosDisponibles.map((permiso) => (
                        <Col key={permiso.nombre} md={6}>
                          <Form.Check
                            type="checkbox"
                            id={`permiso-${permiso.nombre}`}
                            label={permiso.nombre}
                            checked={selectedPermisos.includes(permiso.nombre)}
                            onChange={() => handlePermissionChange(permiso.nombre)}
                            className="mb-2"
                          />
                        </Col>
                      ))
                    ) : (
                      <Col>
                        <small className="text-muted">
                          No hay permisos disponibles para este módulo.
                        </small>
                      </Col>
                    )}
                  </Row>
                </Form.Group>
              )}

              {loading && (
                <Alert variant="info" className="mt-3 text-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Cargando...
                </Alert>
              )}

              <div className="d-flex justify-content-evenly mt-4">
                <Button variant="success" type="submit" disabled={loading}>
                  {"Guardar"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => navigator("/admin/usuarios/todos")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersComponent;