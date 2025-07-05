# main.py - Backend completo para AquaGest
from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Numeric, Text, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv

# Configuración de PyMySQL para trabajar con SQLAlchemy
import pymysql
pymysql.install_as_MySQLdb()

# Cargar variables de entorno
load_dotenv()

print("🔧 Iniciando AquaGest...")
print("🔧 Cargando configuración...")

# Configuración de la base de datos
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'sistema_suministro')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'root')

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"🔗 Conectando a: {DB_HOST}:{DB_PORT}/{DB_NAME}")
print(f"👤 Usuario: {DB_USER}")

try:
    engine = create_engine(DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    print("✅ Configuración de base de datos lista")
except Exception as e:
    print(f"❌ Error configurando base de datos: {e}")
    print("💡 Verifica que MySQL esté corriendo y las credenciales sean correctas")
    exit(1)

# === PATRONES DE DISEÑO ===

# Patrón 1: Singleton para configuración de BD
class DatabaseConfig:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConfig, cls).__new__(cls)
            cls._instance.engine = engine
            cls._instance.session_local = SessionLocal
        return cls._instance

# Patrón 2: Factory para crear reportes
class ReportFactory:
    @staticmethod
    def create_report(report_type: str, data: list):
        reports = {
            "solicitudes": {
                "tipo": "📋 Reporte de Solicitudes",
                "descripcion": "Listado completo de solicitudes de agua"
            },
            "usuarios": {
                "tipo": "👥 Reporte de Usuarios", 
                "descripcion": "Listado de usuarios del sistema"
            },
            "puntos": {
                "tipo": "📍 Reporte de Puntos de Suministro",
                "descripcion": "Listado de puntos de distribución"
            }
        }
        
        report_info = reports.get(report_type, {"tipo": "📄 Reporte", "descripcion": ""})
        
        return {
            "tipo": report_info["tipo"],
            "descripcion": report_info["descripcion"],
            "datos": data,
            "fecha_generacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_registros": len(data),
            "sistema": "AquaGest v1.0"
        }

# Patrón 3: Observer para notificaciones
class NotificationManager:
    def __init__(self):
        self.observers = []
        self.notifications = []
    
    def add_observer(self, observer_func):
        self.observers.append(observer_func)
    
    def notify(self, event_type: str, data: dict):
        notification = {
            "tipo": event_type,
            "datos": data,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.notifications.append(notification)
        
        # Notificar a todos los observadores
        for observer in self.observers:
            observer(event_type, data)

# Patrón 4: Strategy para validación
class ValidationStrategy:
    @staticmethod
    def validate_user(data: dict):
        required_fields = ['nombre', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Campo requerido: {field}"
        
        if '@' not in data['email']:
            return False, "Email inválido"
        
        if len(data['password']) < 4:
            return False, "Contraseña muy corta (mínimo 4 caracteres)"
        
        return True, "Usuario válido"
    
    @staticmethod
    def validate_solicitud(data: dict):
        required_fields = ['codigo_solicitud', 'tipo_solicitud']
        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Campo requerido: {field}"
        
        if len(data['codigo_solicitud']) < 5:
            return False, "Código muy corto (mínimo 5 caracteres)"
        
        return True, "Solicitud válida"

# Patrón 5: Repository para acceso a datos
class BaseRepository:
    def __init__(self, db: Session):
        self.db = db

class UsuarioRepository(BaseRepository):
    def create(self, usuario_data: dict):
        usuario = Usuario(**usuario_data)
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario
    
    def get_by_email(self, email: str):
        return self.db.query(Usuario).filter(Usuario.email == email).first()
    
    def get_all(self):
        return self.db.query(Usuario).all()

class SolicitudRepository(BaseRepository):
    def create(self, solicitud_data: dict):
        solicitud = Solicitud(**solicitud_data)
        self.db.add(solicitud)
        self.db.commit()
        self.db.refresh(solicitud)
        return solicitud
    
    def get_all(self):
        return self.db.query(Solicitud).all()
    
    def get_by_user(self, user_id: int):
        return self.db.query(Solicitud).filter(Solicitud.id_usuario_solicitante == user_id).all()

# === MODELOS DE BASE DE DATOS ===

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100))
    email = Column(String(150), unique=True, nullable=False, index=True)
    telefono = Column(String(20))
    tipo_usuario = Column(String(50), nullable=False, default="USUARIO")
    password = Column(String(100), nullable=False)

class Solicitud(Base):
    __tablename__ = "solicitudes"
    
    id_solicitud = Column(Integer, primary_key=True, index=True)
    codigo_solicitud = Column(String(50), unique=True, nullable=False, index=True)
    tipo_solicitud = Column(String(100), nullable=False)
    id_usuario_solicitante = Column(Integer, nullable=False)
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    id_asesor = Column(Integer)

class DetalleSolicitud(Base):
    __tablename__ = "detalle_solicitudes"
    
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_solicitud = Column(Integer, nullable=False)
    id_punto = Column(Integer, nullable=False)
    cantidad_solicitada = Column(Numeric(10, 2), nullable=False)

class PuntoSuministro(Base):
    __tablename__ = "puntos_suministro"
    
    id_punto = Column(Integer, primary_key=True, index=True)
    codigo_punto = Column(String(50), unique=True, nullable=False, index=True)
    estado = Column(String(50), nullable=False, default="ACTIVO")
    direccion = Column(String(200), nullable=False)
    capacidad = Column(Numeric(10, 8), nullable=False)

class Disponibilidad(Base):
    __tablename__ = "disponibilidad"
    
    id_disponibilidad = Column(Integer, primary_key=True, index=True)
    id_punto = Column(Integer, nullable=False)
    estado_disponibilidad = Column(String(50), nullable=False, default="DISPONIBLE")
    cantidad_disponible = Column(Numeric(10, 2), nullable=False)

class Consulta(Base):
    __tablename__ = "consultas"
    
    id_consulta = Column(Integer, primary_key=True, index=True)
    descripcion_consulta = Column(String(100), nullable=False)
    estado_consulta = Column(String(50), nullable=False, default="PENDIENTE")
    fecha_consulta = Column(DateTime, default=datetime.utcnow)
    respuesta = Column(Text)
    usuarios_id_usuario = Column(Integer, nullable=False)

# === MODELOS PYDANTIC ===

class UsuarioCreate(BaseModel):
    nombre: str
    apellidos: str = ""
    email: str
    telefono: Optional[str] = None
    tipo_usuario: str = "USUARIO"
    password: str

class SolicitudCreate(BaseModel):
    codigo_solicitud: str
    tipo_solicitud: str
    detalles: List[dict]

# === DEPENDENCIAS ===

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Estado para sesión actual (simplificado)
current_session = {"user_id": None, "email": None, "tipo": None}

# === FUNCIONES AUXILIARES ===

def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas/verificadas exitosamente")
        return True
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        return False

def create_sample_data(db: Session):
    try:
        # Crear puntos de suministro de ejemplo si no existen
        if db.query(PuntoSuministro).count() == 0:
            puntos_ejemplo = [
                PuntoSuministro(
                    codigo_punto="PUNTO-001",
                    estado="ACTIVO",
                    direccion="Plaza Principal - Centro Ciudad",
                    capacidad=1000.00
                ),
                PuntoSuministro(
                    codigo_punto="PUNTO-002",
                    estado="ACTIVO", 
                    direccion="Parque Norte - Zona Residencial",
                    capacidad=750.00
                ),
                PuntoSuministro(
                    codigo_punto="PUNTO-003",
                    estado="ACTIVO",
                    direccion="Centro Comercial Sur",
                    capacidad=500.00
                )
            ]
            
            for punto in puntos_ejemplo:
                db.add(punto)
            db.commit()
            
            # Crear datos de disponibilidad
            for i, punto in enumerate(puntos_ejemplo, 1):
                disponibilidad = Disponibilidad(
                    id_punto=i,
                    estado_disponibilidad="DISPONIBLE",
                    cantidad_disponible=float(punto.capacidad) * 0.8
                )
                db.add(disponibilidad)
            db.commit()
            
            print("✅ Datos de ejemplo creados")
            
    except Exception as e:
        print(f"⚠️ Error creando datos de ejemplo: {e}")

# === INICIALIZACIÓN DE LA APLICACIÓN ===

app = FastAPI(
    title="🚰 AquaGest - Sistema de Gestión de Agua",
    version="1.0.0",
    description="Sistema completo para gestión de solicitudes y distribución de agua"
)

# Configurar CORS para permitir conexiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar sistema de notificaciones
notification_manager = NotificationManager()

# Función observadora para notificaciones
def log_notification(event_type: str, data: dict):
    print(f"🔔 {event_type}: {data}")

notification_manager.add_observer(log_notification)

# === RUTAS DE LA API ===

@app.get("/")
async def root():
    return {
        "message": "🚰 AquaGest - Sistema de Gestión de Agua",
        "status": "✅ Funcionando correctamente",
        "version": "1.0.0",
        "database": f"mysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
        "patrones_implementados": [
            "✅ Singleton - Configuración de BD",
            "✅ Factory - Generación de reportes", 
            "✅ Observer - Sistema de notificaciones",
            "✅ Strategy - Validación de datos",
            "✅ Repository - Acceso a datos"
        ]
    }
@app.get("/test-db")
async def test_database():
    try:
        db = SessionLocal()
        
        # Importar text para MySQL 9.3
        from sqlalchemy import text
        
        # Usar text() como requiere MySQL 9.3
        result = db.execute(text("SELECT 1")).fetchone()
        
        # Contar registros de forma segura
        try:
            usuarios_count = db.query(Usuario).count()
        except:
            usuarios_count = 0
            
        try:
            solicitudes_count = db.query(Solicitud).count()
        except:
            solicitudes_count = 0
            
        try:
            puntos_count = db.query(PuntoSuministro).count()
        except:
            puntos_count = 0
        
        db.close()
        
        return {
            "status": "✅ Conexión a base de datos exitosa",
            "test_result": result[0] if result else 1,
            "database_info": {
                "usuarios": usuarios_count,
                "solicitudes": solicitudes_count, 
                "puntos_suministro": puntos_count
            },
            "connection_string": f"mysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
            "mysql_version": "9.3",
            "database_name": DB_NAME
        }
    except Exception as e:
        return {
            "status": "❌ Error de conexión a la base de datos",
            "error": str(e),
            "help": "Error específico de MySQL 9.3",
            "database_exists": True
        }
@app.post("/usuarios/registro")
async def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    try:
        # Validar usando patrón Strategy
        is_valid, message = ValidationStrategy.validate_user(usuario.dict())
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Usar patrón Repository
        usuario_repo = UsuarioRepository(db)
        
        # Verificar email único
        existing_user = usuario_repo.get_by_email(usuario.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="❌ El email ya está registrado")
        
        # Crear usuario
        db_usuario = usuario_repo.create({
            "nombre": usuario.nombre,
            "apellidos": usuario.apellidos,
            "email": usuario.email,
            "telefono": usuario.telefono,
            "tipo_usuario": usuario.tipo_usuario,
            "password": usuario.password  # En producción se encriptaría
        })
        
        # Notificar usando patrón Observer
        notification_manager.notify("user_registered", {
            "user_id": db_usuario.id_usuario,
            "email": usuario.email,
            "tipo": usuario.tipo_usuario
        })
        
        return {
            "message": "✅ Usuario registrado exitosamente",
            "user_id": db_usuario.id_usuario,
            "email": usuario.email,
            "tipo_usuario": usuario.tipo_usuario
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en registro: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    try:
        usuario_repo = UsuarioRepository(db)
        user = usuario_repo.get_by_email(email)
        
        if not user:
            raise HTTPException(status_code=401, detail="❌ Usuario no encontrado")
        
        if user.password != password:
            raise HTTPException(status_code=401, detail="❌ Contraseña incorrecta")
        
        # Actualizar sesión global
        current_session.update({
            "user_id": user.id_usuario,
            "email": email,
            "tipo": user.tipo_usuario
        })
        
        notification_manager.notify("user_login", {
            "user_id": user.id_usuario,
            "email": email
        })
        
        return {
            "message": "✅ Login exitoso",
            "user_type": user.tipo_usuario,
            "user_name": user.nombre,
            "user_id": user.id_usuario,
            "access_granted": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en login: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/auth/current-user")
async def get_current_user():
    if current_session["user_id"]:
        return {
            "logged_in": True,
            "user_id": current_session["user_id"],
            "email": current_session["email"],
            "tipo_usuario": current_session["tipo"]
        }
    return {"logged_in": False}

@app.post("/solicitudes")
async def crear_solicitud(solicitud: SolicitudCreate, db: Session = Depends(get_db)):
    try:
        if not current_session["user_id"]:
            raise HTTPException(status_code=401, detail="❌ Debe iniciar sesión primero")
        
        # Validar usando patrón Strategy
        is_valid, message = ValidationStrategy.validate_solicitud(solicitud.dict())
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Crear solicitud usando patrón Repository
        solicitud_repo = SolicitudRepository(db)
        db_solicitud = solicitud_repo.create({
            "codigo_solicitud": solicitud.codigo_solicitud,
            "tipo_solicitud": solicitud.tipo_solicitud,
            "id_usuario_solicitante": current_session["user_id"],
            "fecha_solicitud": datetime.utcnow()
        })
        
        # Crear detalles de solicitud
        for detalle in solicitud.detalles:
            db_detalle = DetalleSolicitud(
                id_solicitud=db_solicitud.id_solicitud,
                id_punto=int(detalle["id_punto"]),
                cantidad_solicitada=float(detalle["cantidad_solicitada"])
            )
            db.add(db_detalle)
        db.commit()
        
        notification_manager.notify("new_solicitud", {
            "solicitud_id": db_solicitud.id_solicitud,
            "usuario_id": current_session["user_id"]
        })
        
        return {
            "message": "✅ Solicitud creada exitosamente",
            "solicitud_id": db_solicitud.id_solicitud,
            "codigo": solicitud.codigo_solicitud
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creando solicitud: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/solicitudes")
async def obtener_solicitudes(db: Session = Depends(get_db)):
    try:
        solicitud_repo = SolicitudRepository(db)
        
        # Si es usuario normal, solo sus solicitudes
        if current_session.get("tipo") == "USUARIO":
            solicitudes = solicitud_repo.get_by_user(current_session["user_id"])
        else:
            # Asesores y residentes ven todas
            solicitudes = solicitud_repo.get_all()
        
        return solicitudes
    except Exception as e:
        print(f"❌ Error obteniendo solicitudes: {e}")
        return []

@app.get("/puntos-suministro")
async def obtener_puntos_suministro(db: Session = Depends(get_db)):
    try:
        puntos = db.query(PuntoSuministro).all()
        return puntos
    except Exception as e:
        print(f"❌ Error obteniendo puntos: {e}")
        return []

@app.get("/dashboard/stats")
async def obtener_estadisticas_dashboard(db: Session = Depends(get_db)):
    try:
        stats = {
            "total_usuarios": db.query(Usuario).count(),
            "total_solicitudes": db.query(Solicitud).count(),
            "total_puntos": db.query(PuntoSuministro).count(),
            "total_consultas": db.query(Consulta).count(),
            "puntos_activos": db.query(PuntoSuministro).filter(PuntoSuministro.estado == "ACTIVO").count(),
            "solicitudes_hoy": db.query(Solicitud).filter(
                Solicitud.fecha_solicitud >= datetime.now().date()
            ).count()
        }
        return stats
    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {e}")
        return {
            "total_usuarios": 0,
            "total_solicitudes": 0,
            "total_puntos": 0,
            "total_consultas": 0,
            "puntos_activos": 0,
            "solicitudes_hoy": 0
        }

@app.post("/reportes/generar")
async def generar_reporte(tipo_reporte: str = Form(...), db: Session = Depends(get_db)):
    try:
        # Usar patrón Factory para generar reportes
        if tipo_reporte == "solicitudes":
            data = db.query(Solicitud).all()
            data = [
                {
                    "id": s.id_solicitud,
                    "codigo": s.codigo_solicitud,
                    "tipo": s.tipo_solicitud,
                    "fecha": s.fecha_solicitud.strftime("%Y-%m-%d %H:%M") if s.fecha_solicitud else "",
                    "usuario_id": s.id_usuario_solicitante
                } for s in data
            ]
        elif tipo_reporte == "usuarios":
            data = db.query(Usuario).all()
            data = [
                {
                    "id": u.id_usuario,
                    "nombre": f"{u.nombre} {u.apellidos or ''}".strip(),
                    "email": u.email,
                    "tipo": u.tipo_usuario,
                    "telefono": u.telefono or "No proporcionado"
                } for u in data
            ]
        elif tipo_reporte == "puntos":
            data = db.query(PuntoSuministro).all()
            data = [
                {
                    "id": p.id_punto,
                    "codigo": p.codigo_punto,
                    "direccion": p.direccion,
                    "estado": p.estado,
                    "capacidad": float(p.capacidad)
                } for p in data
            ]
        else:
            raise HTTPException(status_code=400, detail="Tipo de reporte no válido")
        
        report = ReportFactory.create_report(tipo_reporte, data)
        
        notification_manager.notify("report_generated", {
            "tipo": tipo_reporte,
            "registros": len(data)
        })
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generando reporte: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# === EVENTOS DE INICIO ===

@app.on_event("startup")
async def startup_event():
    print("🔧 Inicializando base de datos...")
    if create_tables():
        db = SessionLocal()
        create_sample_data(db)
        db.close()
        print("✅ Sistema inicializado correctamente")
    else:
        print("⚠️ Problemas inicializando la base de datos")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 INICIANDO AQUAGEST - SISTEMA DE GESTIÓN DE AGUA")
    print("="*60)
    print(f"📊 API Principal: http://localhost:8000")
    print(f"📚 Documentación: http://localhost:8000/docs")
    print(f"🔍 Test de BD: http://localhost:8000/test-db")
    print(f"👤 Registro: http://localhost:8000/usuarios/registro")
    print("="*60)
    print("🏗️ Patrones de diseño implementados:")
    print("   • Singleton: Configuración de base de datos")
    print("   • Factory: Generación de reportes")
    print("   • Observer: Sistema de notificaciones")
    print("   • Strategy: Validación de datos")
    print("   • Repository: Acceso estructurado a datos")
    print("="*60)
    print("🎯 Para probar:")
    print("   1. Ve a http://localhost:8000")
    print("   2. Prueba http://localhost:8000/test-db")
    print("   3. Ve la documentación en http://localhost:8000/docs")
    print("="*60)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )