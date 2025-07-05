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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
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
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error de Conexión
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-left bg-gray-50 p-3 rounded mb-4 text-sm">
            <p className="font-semibold">Verifica:</p>
            <p>• Backend en http://localhost:8000</p>
            <p>• Base de datos MySQL conectada</p>
            <p>• Sin errores en el servidor</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            {formData.isRegistering ? "Registro" : "Iniciar Sesión"}
          </h1>
          <p className="text-gray-600 mt-2">
            AquaGest - Sistema de Gestión de Agua
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) =>
                    setFormData({ ...formData, apellidos: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tus apellidos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario *
                </label>
                <select
                  value={formData.tipo_usuario}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_usuario: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USUARIO">👤 Usuario - Solicitar agua</option>
                  <option value="ASESOR">
                    👨‍💼 Asesor - Gestionar solicitudes
                  </option>
                  <option value="RESIDENTE">
                    🏛️ Residente - Administrar sistema
                  </option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 4 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "⏳ Cargando..."
              : formData.isRegistering
              ? "📝 Registrarse"
              : "🚪 Iniciar Sesión"}
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
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {formData.isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>

        {!formData.isRegistering && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-2">💡 Usuarios de prueba:</p>
            <div className="space-y-1">
              <p>
                <strong>Usuario:</strong> usuario@test.com / 123456
              </p>
              <p>
                <strong>Asesor:</strong> asesor@test.com / 123456
              </p>
              <p>
                <strong>Admin:</strong> admin@test.com / 123456
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== COMPONENTE NAVEGACIÓN ==========
const Navbar = ({ user, onLogout, currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      roles: ["Solicitante", "Asesor", "Administrador"],
    },
    {
      id: "nueva-solicitud",
      label: "Nueva Solicitud",
      icon: Plus,
      roles: ["Solicitante"],
    },
    {
      id: "mis-solicitudes",
      label: "Mis Solicitudes",
      icon: FileText,
      roles: ["Solicitante"],
    },
    {
      id: "gestionar-solicitudes",
      label: "Gestionar Solicitudes",
      icon: CheckCircle,
      roles: ["Asesor", "Administrador"],
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: BarChart3,
      roles: ["Asesor", "Administrador"],
    },
    {
      id: "puntos",
      label: "Puntos de Suministro",
      icon: MapPin,
      roles: ["Asesor", "Administrador"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.tipo_usuario)
  );

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              AquaGest
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user?.nombre}</span>
              <br />
              <span className="text-xs">({user?.tipo_usuario})</span>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                      currentView === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
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

// ========== DASHBOARD ==========
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
  const [connectionStatus, setConnectionStatus] = useState("checking");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await apiService.getDashboardStats();
        setStats(statsData);
        setConnectionStatus("connected");
      } catch (error) {
        console.error("Error fetching data:", error);
        setConnectionStatus("error");
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.total_usuarios,
      icon: Users,
      color: "blue",
    },
    {
      title: "Solicitudes",
      value: stats.total_solicitudes,
      icon: FileText,
      color: "green",
    },
    {
      title: "Puntos de Suministro",
      value: stats.total_puntos,
      icon: MapPin,
      color: "purple",
    },
    {
      title: "Puntos Activos",
      value: stats.puntos_activos,
      icon: CheckCircle,
      color: "orange",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {user?.nombre}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Dashboard del Sistema de Gestión de Agua
        </p>

        <div className="mt-4">
          {connectionStatus === "checking" && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              🔄 Cargando estadísticas...
            </div>
          )}
          {connectionStatus === "connected" && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ Sistema conectado y funcionando correctamente
            </div>
          )}
          {connectionStatus === "error" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ Error conectando con el servidor
            </div>
          )}
        </div>
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
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-sm text-gray-700">
                Sistema inicializado correctamente
              </span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500 mr-3" />
              <span className="text-sm text-gray-700">
                Base de datos conectada
              </span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-500 mr-3" />
              <span className="text-sm text-gray-700">
                Usuario {user?.nombre} conectado
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
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
                className="bg-green-600 h-2 rounded-full"
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

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Disponibilidad del Sistema
              </span>
              <span className="text-sm font-medium text-blue-600">95%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "95%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Perfil</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-medium">{user?.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo de Usuario</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.tipo_usuario === "Solicitante"
                  ? "bg-blue-100 text-blue-800"
                  : user?.tipo_usuario === "Asesor"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {user?.tipo_usuario}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">ID de Usuario</p>
            <p className="font-medium">#{user?.user_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== NUEVA SOLICITUD ==========
const NuevaSolicitud = () => {
  const [formData, setFormData] = useState({
    codigo_solicitud: "",
    tipo_solicitud: "DOMICILIARIA",
    detalles: [{ id_punto: "", cantidad_solicitada: "" }],
  });
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const puntosData = await apiService.getPuntosSuministro();
        setPuntos(puntosData);
        console.log("✅ Puntos cargados:", puntosData);
      } catch (error) {
        console.error("❌ Error cargando puntos:", error);
      }
    };

    fetchData();

    // Generar código automático
    const codigo = `SOL-${Date.now()}`;
    setFormData((prev) => ({ ...prev, codigo_solicitud: codigo }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("📤 Enviando solicitud:", formData);
      const response = await apiService.createSolicitud(formData);
      console.log("✅ Solicitud creada:", response);
      setMessage("✅ Solicitud creada exitosamente");

      // Limpiar formulario
      setFormData({
        codigo_solicitud: `SOL-${Date.now()}`,
        tipo_solicitud: "DOMICILIARIA",
        detalles: [{ id_punto: "", cantidad_solicitada: "" }],
      });
    } catch (error) {
      console.error("❌ Error creando solicitud:", error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addDetalle = () => {
    setFormData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { id_punto: "", cantidad_solicitada: "" }],
    }));
  };

  const removeDetalle = (index) => {
    setFormData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const updateDetalle = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) =>
        i === index ? { ...detalle, [field]: value } : detalle
      ),
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Nueva Solicitud de Agua
      </h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.includes("exitosamente")
              ? "bg-green-100 text-green-700 border border-green-400"
              : "bg-red-100 text-red-700 border border-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Solicitud
              </label>
              <input
                type="text"
                value={formData.codigo_solicitud}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Solicitud
              </label>
              <select
                value={formData.tipo_solicitud}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_solicitud: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DOMICILIARIA">🏠 Domiciliaria</option>
                <option value="COMERCIAL">🏪 Comercial</option>
                <option value="INDUSTRIAL">🏭 Industrial</option>
                <option value="EMERGENCIA">🚨 Emergencia</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles de la Solicitud
              </h3>
              <button
                type="button"
                onClick={addDetalle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Punto
              </button>
            </div>

            {formData.detalles.map((detalle, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Punto de Suministro
                  </label>
                  <select
                    value={detalle.id_punto}
                    onChange={(e) =>
                      updateDetalle(index, "id_punto", e.target.value)
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar punto</option>
                    {puntos.map((punto) => (
                      <option key={punto.id_punto} value={punto.id_punto}>
                        {punto.codigo_punto} - {punto.direccion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad Solicitada (L)
                  </label>
                  <input
                    type="number"
                    value={detalle.cantidad_solicitada}
                    onChange={(e) =>
                      updateDetalle(
                        index,
                        "cantidad_solicitada",
                        e.target.value
                      )
                    }
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cantidad en litros"
                  />
                </div>

                <div className="flex items-end">
                  {formData.detalles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDetalle(index)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  codigo_solicitud: `SOL-${Date.now()}`,
                  tipo_solicitud: "DOMICILIARIA",
                  detalles: [{ id_punto: "", cantidad_solicitada: "" }],
                })
              }
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Creando..." : "✅ Crear Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========== MIS SOLICITUDES ==========
const MisSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await apiService.getSolicitudes();
        setSolicitudes(data);
        console.log("✅ Solicitudes cargadas:", data);
      } catch (error) {
        console.error("❌ Error cargando solicitudes:", error);
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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Solicitudes</h1>

      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes solicitudes
          </h3>
          <p className="text-gray-600">
            Crea tu primera solicitud de agua para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id_solicitud}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {solicitud.codigo_solicitud}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tipo: {solicitud.tipo_solicitud}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fecha:{" "}
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString(
                      "es-ES"
                    )}
                  </p>
                </div>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  PENDIENTE
                </span>
              </div>

              <div className="flex justify-end">
                <button className="text-blue-600 hover:text-blue-900 flex items-center">
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

// ========== GESTIONAR SOLICITUDES ==========
const GestionarSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("TODAS");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await apiService.getSolicitudes();
        setSolicitudes(data);
        console.log("✅ Solicitudes cargadas para gestión:", data);
      } catch (error) {
        console.error("❌ Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const filteredSolicitudes = solicitudes.filter(
    (sol) => filtro === "TODAS" || sol.estado === filtro
  );

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestionar Solicitudes
        </h1>

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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSolicitudes.map((solicitud) => (
                <tr key={solicitud.id_solicitud} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {solicitud.codigo_solicitud}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {solicitud.tipo_solicitud}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Usuario #{solicitud.id_usuario_solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString(
                      "es-ES"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      PENDIENTE
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-5 w-5" />
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

// ========== REPORTES ==========
const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);

  const generarReporte = async (tipo) => {
    setLoading(true);
    try {
      console.log("📊 Generando reporte:", tipo);
      const reporte = await apiService.generateReport(tipo);
      console.log("✅ Reporte generado:", reporte);
      setReportes((prev) => [reporte, ...prev]);
    } catch (error) {
      console.error("❌ Error generando reporte:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Reportes del Sistema
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => generarReporte("solicitudes")}
          disabled={loading}
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex flex-col items-center transition-colors"
        >
          <FileText className="h-8 w-8 mb-2" />
          <span className="font-semibold">Reporte de Solicitudes</span>
          <span className="text-sm mt-1">Ver todas las solicitudes</span>
        </button>

        <button
          onClick={() => generarReporte("usuarios")}
          disabled={loading}
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 disabled:opacity-50 flex flex-col items-center transition-colors"
        >
          <Users className="h-8 w-8 mb-2" />
          <span className="font-semibold">Reporte de Usuarios</span>
          <span className="text-sm mt-1">Listado de usuarios</span>
        </button>

        <button
          onClick={() => generarReporte("puntos")}
          disabled={loading}
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex flex-col items-center transition-colors"
        >
          <MapPin className="h-8 w-8 mb-2" />
          <span className="font-semibold">Reporte de Puntos</span>
          <span className="text-sm mt-1">Puntos de suministro</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reportes Generados
        </h3>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-pulse">⏳ Generando reporte...</div>
          </div>
        )}

        {reportes.length === 0 && !loading ? (
          <p className="text-gray-500 text-center py-8">
            No hay reportes generados. Usa los botones de arriba para crear
            reportes.
          </p>
        ) : (
          <div className="space-y-4">
            {reportes.map((reporte, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {reporte.tipo}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {reporte.descripcion}
                    </p>
                    <p className="text-sm text-gray-600">
                      Generado: {reporte.fecha_generacion}
                    </p>
                    <p className="text-sm text-gray-600">
                      Registros: {reporte.total_registros}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-900 flex items-center">
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

// ========== PUNTOS DE SUMINISTRO ==========
const PuntosSuministro = () => {
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const data = await apiService.getPuntosSuministro();
        setPuntos(data);
        console.log("✅ Puntos cargados:", data);
      } catch (error) {
        console.error("❌ Error cargando puntos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPuntos();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Puntos de Suministro
          </h1>
          <p>Cargando puntos de suministro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Puntos de Suministro
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puntos.map((punto) => (
          <div
            key={punto.id_punto}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {punto.codigo_punto}
                </h3>
                <p className="text-sm text-gray-600">ID: #{punto.id_punto}</p>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  punto.estado === "ACTIVO"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {punto.estado}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <span className="text-sm text-gray-700">{punto.direccion}</span>
              </div>
              <div className="flex items-center">
                <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-700">
                  Capacidad: {parseFloat(punto.capacidad).toLocaleString()} L
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== APP PRINCIPAL ==========
export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

  const handleLogin = (userData) => {
    console.log("✅ Usuario logueado:", userData);
    setUser(userData);
  };

  const handleLogout = () => {
    console.log("👋 Usuario deslogueado");
    setUser(null);
    setCurrentView("dashboard");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "nueva-solicitud":
        return <NuevaSolicitud />;
      case "mis-solicitudes":
        return <MisSolicitudes />;
      case "gestionar-solicitudes":
        return <GestionarSolicitudes />;
      case "reportes":
        return <Reportes />;
      case "puntos":
        return <PuntosSuministro />;
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
        <main className="max-w-7xl mx-auto">{renderCurrentView()}</main>
      </div>
    </AppContext.Provider>
  );
}
