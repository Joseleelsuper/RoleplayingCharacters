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
    postgres_url: Optional[str] = os.getenv("POSTGRES_URL")
    postgres_user: str = os.getenv("POSTGRES_USER", "postgres")
    postgres_host: str = os.getenv("POSTGRES_HOST", "db.jtmlavskczvyblwgamaw.supabase.co")
    postgres_password: Optional[str] = os.getenv("POSTGRES_PASSWORD")
    postgres_database: str = os.getenv("POSTGRES_DATABASE", "postgres")
    postgres_prisma_url: Optional[str] = os.getenv("POSTGRES_PRISMA_URL")
    postgres_url_non_pooling: Optional[str] = os.getenv("POSTGRES_URL_NON_POOLING")
    
    # Configuración Supabase
    supabase_url: str = os.getenv("SUPABASE_URL", "https://jtmlavskczvyblwgamaw.supabase.co")
    supabase_anon_key: Optional[str] = os.getenv("SUPABASE_ANON_KEY")
    supabase_jwt_secret: Optional[str] = os.getenv("SUPABASE_JWT_SECRET")
    supabase_service_role_key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    next_public_supabase_url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://jtmlavskczvyblwgamaw.supabase.co")
    next_public_supabase_anon_key: Optional[str] = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

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

    # Configuración de idiomas
    allowed_languages: list[str] = ["es", "en"]
    default_locale: str = "es"


# Instancia global de configuración
settings = Settings()
