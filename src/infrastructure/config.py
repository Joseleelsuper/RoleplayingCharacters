"""
Configuración de la aplicación.

Este módulo contiene las configuraciones y variables de entorno
utilizadas por la aplicación de gestión de personajes de rol.
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Cargar variables de entorno desde archivo .env
load_dotenv()


class Settings:
    """
    Configuración de la aplicación.

    Las variables se cargan desde variables de entorno
    o valores por defecto si no están presentes.
    """

    # Configuración de la aplicación
    app_name: str = os.getenv("APP_NAME", "Roleplaying Characters Manager")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Configuración del servidor
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))

    # Configuración de base de datos
    database_url: Optional[str] = os.getenv("DATABASE_URL")
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_name: str = os.getenv("DB_NAME", "roleplaying_characters")
    db_user: str = os.getenv("DB_USER", "username")
    db_password: str = os.getenv("DB_PASSWORD", "password")

    # Configuración de seguridad
    secret_key: str = os.getenv(
        "SECRET_KEY", "development-secret-key-change-in-production"
    )
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    # Configuración CORS
    allowed_origins: list[str] = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000"
    ).split(",")

    # Configuración de logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = os.getenv(
        "LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )


# Instancia global de configuración
settings = Settings()
