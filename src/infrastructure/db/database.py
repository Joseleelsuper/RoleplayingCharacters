from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from ..config import settings
import logging

logger = logging.getLogger(__name__)

# Crear el engine de la base de datos
def create_database_engine():
    """
    Crea y configura el engine de la base de datos PostgreSQL.
    """
    if not settings.postgres_url:
        raise ValueError("POSTGRES_URL no está configurada en las variables de entorno")
    
    # Convertir postgres:// a postgresql:// para compatibilidad con SQLAlchemy 2.0
    postgres_url = settings.postgres_url
    if postgres_url.startswith("postgres://"):
        postgres_url = postgres_url.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(
        postgres_url,
        echo=settings.debug,  # Mostrar SQL queries en modo debug
        pool_pre_ping=True,   # Verificar conexiones antes de usarlas
        pool_recycle=3600,    # Reciclar conexiones cada hora
    )
    
    logger.info("Engine de base de datos creado exitosamente")
    return engine

# Crear el engine global
engine = create_database_engine()

# Crear la clase de sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Función para obtener una sesión de base de datos
def get_db():
    """
    Generador que proporciona una sesión de base de datos.
    Se usa como dependencia en FastAPI.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para crear todas las tablas
def create_tables():
    """
    Crea todas las tablas en la base de datos.
    """
    from .models.base import Base
    Base.metadata.create_all(bind=engine)
    logger.info("Tablas de base de datos creadas exitosamente")

# Función para verificar la conexión
def check_database_connection():
    """
    Verifica que la conexión a la base de datos funcione correctamente.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Conexión a la base de datos verificada exitosamente")
        return True
    except Exception as e:
        logger.error(f"Error al conectar con la base de datos: {e}")
        return False