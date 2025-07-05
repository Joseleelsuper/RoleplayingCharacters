"""
Controlador para endpoints relacionados con la página principal.

Este módulo contiene los endpoints HTTP para la funcionalidad básica
de la aplicación, incluyendo la página de inicio y verificaciones de salud.
"""

import os
from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from src.infrastructure.translation_service import translation_service

router = APIRouter()

# Configurar el directorio de templates
templates_dir = Path(__file__).parent.parent.parent.parent / "templates" / "html"
templates = Jinja2Templates(directory=str(templates_dir))


@router.get("/", response_class=HTMLResponse, tags=["Home"])
async def get_home_page(request: Request) -> HTMLResponse:
    """
    Endpoint que devuelve la página principal de la aplicación.

    Args:
        request: Objeto Request de FastAPI para detectar el idioma

    Returns:
        HTMLResponse: HTML con la página de inicio traducida
    """
    # Recargar traducciones en desarrollo para permitir cambios en vivo
    if not os.getenv("VERCEL"):
        translation_service.reload_translations()

    language = translation_service.get_language_from_request(request)

    # Crear función de traducción directa para debugging
    def translate(key: str, domain: str = "home") -> str:
        result = translation_service.get_translation(key, language, domain)
        print(f"DEBUG: Traduciendo '{key}' en '{language}/{domain}' -> '{result}'")
        return result

    return templates.TemplateResponse(
        "home.html",
        {
            "request": request,
            "language": language,
            "_": translate,
            "available_domains": translation_service.get_available_domains(),
        },
    )


@router.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """
    Endpoint de verificación de salud de la aplicación.

    Returns:
        dict[str, str]: Estado de la aplicación
    """
    return {"status": "healthy", "message": "Roleplaying Characters Manager is running"}
