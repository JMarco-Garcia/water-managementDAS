import React, { useState, useEffect, createContext, useContext } from "react";
import {
  User,
  FileText,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  MapPin,
  Droplets,
  Bell,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Home,
  AlertCircle,
  Clock,
  CheckSquare,
  Send,
  Ticket,
  Calendar,
  Phone,
  Mail,
  MapPinIcon,
} from "lucide-react";

// Context para manejo de estado global
const AppContext = createContext();

// ========== SERVICIO API COMPLETO ==========
class APIService {
  constructor() {
    this.baseURL = "http://localhost:8000";
    console.log("🔗 API Service inicializado:", this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    try {
      console.log(`📡 API Request: ${config.method || "GET"} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error("❌ API Error:", data);
        throw new Error(data.detail || `Error: ${response.status}`);
      }

      console.log("✅ API Success:", endpoint, data);
      return data;
    } catch (error) {
      console.error("🚨 API Error:", error);
      throw error;
    }
  }

  // Conexión y autenticación
  async testConnection() {
    return this.request("/test-db");
  }

  async login(email, password) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    return this.request("/auth/login", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    });
  }

  async register(userData) {
    return this.request("/usuarios/registro", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request("/auth/current-user");
  }

  // Solicitudes
  async getSolicitudes() {
    return this.request("/solicitudes");
  }

  async createSolicitud(solicitudData) {
    return this.request("/solicitudes", {
      method: "POST",
      body: JSON.stringify(solicitudData),
    });
  }

  // Puntos de suministro
  async getPuntosSuministro() {
    return this.request("/puntos-suministro");
  }

  // Dashboard
  async getDashboardStats() {
    return this.request("/dashboard/stats");
  }

  // Reportes
  async generateReport(tipoReporte) {
    const formData = new FormData();
    formData.append("tipo_reporte", tipoReporte);

    return this.request("/reportes/generar", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    });
  }
}

const apiService = new APIService();

// ========== COMPONENTE LOGIN/REGISTRO ==========
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isRegistering: false,
    nombre: "",
    apellidos: "",
    telefono: "",
    tipo_usuario: "USUARIO",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("checking");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await apiService.testConnection();
        console.log("🔗 Conexión exitosa:", result);
        setConnectionStatus("connected");
      } catch (error) {
        console.error("❌ Error de conexión:", error);
        setConnectionStatus("error");
        setError(
          "No se puede conectar al backend. Verifica que esté corriendo en http://localhost:8000"
        );
      }
    };

    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formData.isRegistering) {
        const response = await apiService.register({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          tipo_usuario: formData.tipo_usuario,
          password: formData.password,
        });
        console.log("✅ Registro exitoso:", response);
        setSuccess(
          "✅ Usuario registrado exitosamente. Ahora puedes iniciar sesión."
        );
        setFormData({ ...formData, isRegistering: false });
      } else {
        const response = await apiService.login(
          formData.email,
          formData.password
        );
        console.log("✅ Login exitoso:", response);
        onLogin({
          email: formData.email,
          tipo_usuario: response.user_type,
          nombre: response.user_name,
          user_id: response.user_id,
        });
      }
    } catch (error) {
      console.error("❌ Error auth:", error);
      setError(error.message || "Error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  if (connectionStatus === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conectando al servidor...
          </h2>
          <p className="text-gray-600">Verificando conexión con el backend</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error de Conexión
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {formData.isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}
          </h1>
          <p className="text-gray-600 mt-2">AquaGest - Gestión de Agua</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Tu número de teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cuenta
                </label>
                <select
                  value={formData.tipo_usuario}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_usuario: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="USUARIO">Usuario - Solicitar agua</option>
                  <option value="ASESOR">Asesor - Gestionar solicitudes</option>
                  <option value="RESIDENTE">Residente - Administrar</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Mínimo 4 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading
              ? "Cargando..."
              : formData.isRegistering
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setFormData({
                ...formData,
                isRegistering: !formData.isRegistering,
              });
              setError("");
              setSuccess("");
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {formData.isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== COMPONENTE NAVEGACIÓN ==========
const Navbar = ({ user, onLogout, currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getMenuItems = () => {
    switch (user?.tipo_usuario) {
      case "USUARIO":
        return [
          { id: "solicitar-agua", label: "Solicitar Agua", icon: Droplets },
          { id: "mis-solicitudes", label: "Mis Solicitudes", icon: FileText },
        ];
      case "ASESOR":
        return [
          { id: "gestionar-solicitudes", label: "Solicitudes", icon: CheckCircle },
          { id: "generar-tickets", label: "Tickets", icon: Ticket },
        ];
      case "RESIDENTE":
        return [
          { id: "dashboard", label: "Dashboard", icon: BarChart3 },
          { id: "reportes", label: "Reportes", icon: FileText },
          { id: "administrar", label: "Administrar", icon: Users },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              AquaGest
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user?.nombre}</div>
              <div className="text-xs text-gray-500">{user?.tipo_usuario}</div>
            </div>
            <button
              onClick={onLogout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Salir
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-lg text-base font-medium ${
                      currentView === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ========== SOLICITAR AGUA (USUARIO) ==========
const SolicitarAgua = () => {
  const { user } = useContext(AppContext);
  const [formData, setFormData] = useState({
    cantidad_agua: "",
    direccion: "",
    telefono: "",
    motivo: "",
    fecha_preferida: "",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const solicitudData = {
        codigo_solicitud: `SOL-${Date.now()}`,
        tipo_solicitud: "DOMICILIARIA",
        detalles: [
          {
            id_punto: 1, // Punto por defecto
            cantidad_solicitada: formData.cantidad_agua,
          },
        ],
      };

      const response = await apiService.createSolicitud(solicitudData);
      setMessage("✅ Solicitud enviada exitosamente. Te contactaremos pronto.");
      
      // Limpiar formulario
      setFormData({
        cantidad_agua: "",
        direccion: "",
        telefono: "",
        motivo: "",
        fecha_preferida: "",
        observaciones: "",
      });
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Droplets className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitar Agua</h1>
        <p className="text-gray-600 mt-2">
          Completa el formulario para solicitar agua potable
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("exitosamente")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de agua (litros) *
              </label>
              <input
                type="number"
                required
                value={formData.cantidad_agua}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad_agua: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Ej: 100"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha preferida
              </label>
              <input
                type="date"
                value={formData.fecha_preferida}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_preferida: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección completa *
            </label>
            <input
              type="text"
              required
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Calle, número, colonia, ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de contacto *
            </label>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Tu número de teléfono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la solicitud *
            </label>
            <select
              required
              value={formData.motivo}
              onChange={(e) =>
                setFormData({ ...formData, motivo: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Selecciona un motivo</option>
              <option value="uso_domestico">Uso doméstico</option>
              <option value="emergencia">Emergencia</option>
              <option value="evento">Evento especial</option>
              <option value="comercial">Uso comercial</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones adicionales
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Información adicional que consideres importante..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  cantidad_agua: "",
                  direccion: "",
                  telefono: "",
                  motivo: "",
                  fecha_preferida: "",
                  observaciones: "",
                })
              }
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
            >
              {loading ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========== MIS SOLICITUDES (USUARIO) ==========
const MisSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await apiService.getSolicitudes();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Mis Solicitudes
          </h1>
          <p>Cargando tus solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes</h1>
        <p className="text-gray-600 mt-2">
          Revisa el estado de tus solicitudes de agua
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes solicitudes
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera solicitud de agua para comenzar.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Solicitar Agua
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id_solicitud}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {solicitud.codigo_solicitud}
                    </h3>
                    <span className="ml-3 inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString(
                        "es-ES"
                      )}
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2" />
                      {solicitud.tipo_solicitud}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      En proceso
                    </div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-900 flex items-center text-sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== GESTIONAR SOLICITUDES (ASESOR) ==========
const GestionarSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("TODAS");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await apiService.getSolicitudes();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const aprobarSolicitud = (id) => {
    // Aquí iría la lógica para aprobar
    console.log("Aprobando solicitud:", id);
  };

  const rechazarSolicitud = (id) => {
    // Aquí iría la lógica para rechazar
    console.log("Rechazando solicitud:", id);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Gestionar Solicitudes
          </h1>
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestionar Solicitudes
          </h1>
          <p className="text-gray-600 mt-2">
            Revisa y aprueba las solicitudes de agua
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="TODAS">Todas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADO">Aprobadas</option>
            <option value="RECHAZADO">Rechazadas</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitudes.map((solicitud) => (
                <tr key={solicitud.id_solicitud} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {solicitud.codigo_solicitud}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Usuario #{solicitud.id_usuario_solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString(
                      "es-ES"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {solicitud.tipo_solicitud}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => aprobarSolicitud(solicitud.id_solicitud)}
                        className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors"
                        title="Aprobar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => rechazarSolicitud(solicitud.id_solicitud)}
                        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors"
                        title="Rechazar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ========== GENERAR TICKETS (ASESOR) ==========
const GenerarTickets = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      codigo: "TICKET-001",
      usuario: "Juan Pérez",
      cantidad: "100L",
      fecha_recojo: "2024-01-15",
      punto_recojo: "Plaza Principal",
      estado: "Activo",
    },
    {
      id: 2,
      codigo: "TICKET-002",
      usuario: "María García",
      cantidad: "75L",
      fecha_recojo: "2024-01-16",
      punto_recojo: "Parque Norte",
      estado: "Usado",
    },
  ]);

  const generarNuevoTicket = () => {
    const nuevoTicket = {
      id: tickets.length + 1,
      codigo: `TICKET-${String(tickets.length + 1).padStart(3, "0")}`,
      usuario: "Usuario Nuevo",
      cantidad: "50L",
      fecha_recojo: new Date().toISOString().split("T")[0],
      punto_recojo: "Plaza Principal",
      estado: "Activo",
    };
    setTickets([...tickets, nuevoTicket]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
          <p className="text-gray-600 mt-2">
            Genera tickets para que los usuarios recojan agua
          </p>
        </div>

        <button
          onClick={generarNuevoTicket}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generar Ticket
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Recojo
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Punto
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticket.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.fecha_recojo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.punto_recojo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        ticket.estado === "Activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ========== DASHBOARD (RESIDENTE) ==========
const Dashboard = () => {
  const { user } = useContext(AppContext);
  const [stats, setStats] = useState({
    total_usuarios: 0,
    total_solicitudes: 0,
    total_puntos: 0,
    total_consultas: 0,
    puntos_activos: 0,
    solicitudes_hoy: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await apiService.getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Usuarios Registrados",
      value: stats.total_usuarios,
      icon: Users,
      color: "blue",
    },
    {
      title: "Solicitudes Totales",
      value: stats.total_solicitudes,
      icon: FileText,
      color: "green",
    },
    {
      title: "Puntos Activos",
      value: stats.puntos_activos,
      icon: MapPin,
      color: "purple",
    },
    {
      title: "Solicitudes Hoy",
      value: stats.solicitudes_hoy,
      icon: Clock,
      color: "orange",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.nombre}. Aquí tienes un resumen del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500",
          };

          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">
                Sistema funcionando correctamente
              </span>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500 mr-3" />
              <span className="text-sm text-gray-700">
                {stats.solicitudes_hoy} solicitudes procesadas hoy
              </span>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-500 mr-3" />
              <span className="text-sm text-gray-700">
                {stats.total_usuarios} usuarios en el sistema
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Puntos Activos</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.total_puntos > 0
                    ? Math.round(
                        (stats.puntos_activos / stats.total_puntos) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stats.total_puntos > 0
                        ? Math.round(
                            (stats.puntos_activos / stats.total_puntos) * 100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Disponibilidad del Sistema
                </span>
                <span className="text-sm font-medium text-blue-600">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: "98%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== REPORTES (RESIDENTE) ==========
const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);

  const generarReporte = async (tipo) => {
    setLoading(true);
    try {
      const reporte = await apiService.generateReport(tipo);
      setReportes((prev) => [reporte, ...prev]);
    } catch (error) {
      console.error("Error generando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Genera reportes detallados de la actividad del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => generarReporte("solicitudes")}
          disabled={loading}
          className="bg-white border-2 border-blue-200 hover:border-blue-400 p-6 rounded-xl transition-colors disabled:opacity-50 group"
        >
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Solicitudes</h3>
            <p className="text-sm text-gray-600">Reporte de todas las solicitudes</p>
          </div>
        </button>

        <button
          onClick={() => generarReporte("usuarios")}
          disabled={loading}
          className="bg-white border-2 border-green-200 hover:border-green-400 p-6 rounded-xl transition-colors disabled:opacity-50 group"
        >
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Usuarios</h3>
            <p className="text-sm text-gray-600">Listado de usuarios registrados</p>
          </div>
        </button>

        <button
          onClick={() => generarReporte("puntos")}
          disabled={loading}
          className="bg-white border-2 border-purple-200 hover:border-purple-400 p-6 rounded-xl transition-colors disabled:opacity-50 group"
        >
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Puntos</h3>
            <p className="text-sm text-gray-600">Puntos de suministro</p>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reportes Generados
        </h3>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-600">Generando reporte...</div>
          </div>
        )}

        {reportes.length === 0 && !loading ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No hay reportes generados. Usa los botones de arriba para crear reportes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportes.map((reporte, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {reporte.tipo}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {reporte.descripcion}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Generado: {reporte.fecha_generacion}</span>
                      <span>Registros: {reporte.total_registros}</span>
                    </div>
                  </div>
                  <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm">
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ========== ADMINISTRAR (RESIDENTE) ==========
const Administrar = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [puntos, setPuntos] = useState([]);

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const data = await apiService.getPuntosSuministro();
        setPuntos(data);
      } catch (error) {
        console.error("Error cargando puntos:", error);
      }
    };

    fetchPuntos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona usuarios y puntos de suministro
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("usuarios")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "usuarios"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("puntos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "puntos"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Puntos de Suministro
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "usuarios" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Usuarios
                </h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Funcionalidad de gestión de usuarios en desarrollo</p>
              </div>
            </div>
          )}

          {activeTab === "puntos" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Puntos de Suministro
                </h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Punto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {puntos.map((punto) => (
                  <div
                    key={punto.id_punto}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {punto.codigo_punto}
                        </h4>
                        <p className="text-sm text-gray-600">ID: #{punto.id_punto}</p>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          punto.estado === "ACTIVO"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {punto.estado}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{punto.direccion}</span>
                      </div>
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          Capacidad: {parseFloat(punto.capacidad).toLocaleString()} L
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                        <Edit className="h-4 w-4 inline mr-1" />
                        Editar
                      </button>
                      <button className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== APP PRINCIPAL ==========
export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("");

  useEffect(() => {
    if (user) {
      // Establecer vista inicial según el tipo de usuario
      switch (user.tipo_usuario) {
        case "USUARIO":
          setCurrentView("solicitar-agua");
          break;
        case "ASESOR":
          setCurrentView("gestionar-solicitudes");
          break;
        case "RESIDENTE":
          setCurrentView("dashboard");
          break;
        default:
          setCurrentView("dashboard");
      }
    }
  }, [user]);

  const handleLogin = (userData) => {
    console.log("✅ Usuario logueado:", userData);
    setUser(userData);
  };

  const handleLogout = () => {
    console.log("👋 Usuario deslogueado");
    setUser(null);
    setCurrentView("");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "solicitar-agua":
        return <SolicitarAgua />;
      case "mis-solicitudes":
        return <MisSolicitudes />;
      case "gestionar-solicitudes":
        return <GestionarSolicitudes />;
      case "generar-tickets":
        return <GenerarTickets />;
      case "dashboard":
        return <Dashboard />;
      case "reportes":
        return <Reportes />;
      case "administrar":
        return <Administrar />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={{ user }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          user={user}
          onLogout={handleLogout}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        <main>{renderCurrentView()}</main>
      </div>
    </AppContext.Provider>
  );
}