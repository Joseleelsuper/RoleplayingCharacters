"""
Punto de entrada principal de la aplicación FastAPI.

Este módulo configura la aplicación FastAPI principal con todas las rutas,
middleware y configuraciones necesarias para ejecutar la aplicación web
de gestión de personajes de rol.
"""

import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, RedirectResponse
from starlette.requests import Request as StarletteRequest
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn

from src.infrastructure.translation_service import translation_service
from src.infrastructure.i18n import I18nConfig
from src.infrastructure.config import settings
from src.infrastructure.db.database import create_tables, check_database_connection
from src.infrastructure.web.home_controller import router as home_router
from src.infrastructure.web.status_controller import router as status_router
from src.infrastructure.web.not_found_controller import router as not_found_router
from src.infrastructure.web.character_controller import router as character_router
from src.infrastructure.web.game_controller import router as game_router
from src.infrastructure.web.auth_controller import router as auth_router

from src.infrastructure.dependencies import dependency_container
from src.application.auth_service import AuthenticationService
from src.infrastructure.repositories.user_repository import UserRepository

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class I18nMiddleware(BaseHTTPMiddleware):
    """Middleware para configurar el contexto de internacionalización."""

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Procesa la petición y configura el contexto de idioma.

        Args:
            request: Petición HTTP
            call_next: Siguiente middleware en la cadena

        Returns:
            Response: Respuesta HTTP procesada con cookie de idioma configurada
        """
        # Procesar la petición
        response = await call_next(request)
        
        selected_lang = translation_service.get_language_from_request(request)
        
        # Si hay un idioma seleccionado, configurar la cookie
        if selected_lang:
            response.set_cookie(
                key=I18nConfig.LANGUAGE_COOKIE_NAME,
                value=selected_lang,
                max_age=I18nConfig.LANGUAGE_COOKIE_MAX_AGE,
                httponly=True,
                samesite="lax"
            )
            
        return response


def initialize_database():
    """
    Inicializa la base de datos creando las tablas si es necesario.
    """
    try:
        logger.info("Verificando conexión a la base de datos...")
        if check_database_connection():
            logger.info("✅ Conexión a la base de datos establecida")
            logger.info("Creando tablas si no existen...")
            create_tables()
            logger.info("✅ Base de datos inicializada correctamente")
        else:
            logger.warning("⚠️ No se pudo conectar a la base de datos. La aplicación funcionará sin persistencia.")
    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")
        logger.warning("⚠️ La aplicación funcionará sin persistencia de datos.")


def create_app() -> FastAPI:
    """
    Crea y configura la aplicación FastAPI.

    Returns:
        FastAPI: Aplicación configurada
    """
    
    # Configurar el servicio de autenticación con inyección del repositorio
    dependency_container.set_auth_service_factory(
        lambda: AuthenticationService(UserRepository())
    )
    
    # Inicializar base de datos
    initialize_database()
    
    app = FastAPI(
        title=settings.app_name,
        description="Aplicación web para crear y gestionar personajes de rol",
        version=settings.app_version,
        # docs_url="/docs",
        # redoc_url="/redoc",
    )

    # Configuración CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Middleware de internacionalización
    app.add_middleware(I18nMiddleware)

    # Registrar rutas
    app.include_router(home_router, prefix="", tags=["Home"])
    app.include_router(status_router, tags=["Health"])
    app.include_router(not_found_router, tags=["NotFound"])
    app.include_router(character_router, tags=["Characters"])
    app.include_router(game_router, tags=["Games"])
    app.include_router(auth_router, tags=["Auth"])

    # Configurar archivos estáticos solo en desarrollo
    if not os.getenv("VERCEL"):
        static_dir = Path(__file__).parent.parent / "templates"
        app.mount("/templates/css", StaticFiles(directory=str(static_dir / "css")), name="css")
        app.mount("/templates/js", StaticFiles(directory=str(static_dir / "js")), name="js")
        app.mount("/templates/img", StaticFiles(directory=str(static_dir / "img")), name="img")

    return app


# Crear la instancia de la aplicación
app = create_app()

@app.exception_handler(404)
async def custom_404_handler(request: StarletteRequest, exc: StarletteHTTPException):
    """
    Handler global para redirigir a la página /404 personalizada en caso de error 404.
    """
    return RedirectResponse(url="/404")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
