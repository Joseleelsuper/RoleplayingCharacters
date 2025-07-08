"""
Punto de entrada principal de la aplicación FastAPI.

Este módulo configura la aplicación FastAPI principal con todas las rutas,
middleware y configuraciones necesarias para ejecutar la aplicación web
de gestión de personajes de rol.
"""

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, RedirectResponse
from starlette.requests import Request as StarletteRequest
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn

from .infrastructure.translation_service import translation_service
from infrastructure.i18n import I18nConfig
from src.infrastructure.config import settings
from src.infrastructure.web.home_controller import router as home_router
from src.infrastructure.web.status_controller import router as status_router
from src.infrastructure.web.not_found_controller import router as not_found_router


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


def create_app() -> FastAPI:
    """
    Crea y configura la aplicación FastAPI.

    Returns:
        FastAPI: Aplicación configurada
    """
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

    # Configurar archivos estáticos solo en desarrollo
    if not os.getenv("VERCEL"):
        static_dir = Path(__file__).parent.parent / "templates"
        app.mount("/css", StaticFiles(directory=str(static_dir / "css")), name="css")
        app.mount("/js", StaticFiles(directory=str(static_dir / "js")), name="js")
        app.mount("/img", StaticFiles(directory=str(static_dir / "img")), name="img")

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
