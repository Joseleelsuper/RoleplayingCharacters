"""
Controlador para endpoints relacionados con la página principal.

Este módulo contiene los endpoints HTTP para la funcionalidad básica
de la aplicación, incluyendo la página de inicio y verificaciones de salud.
"""

from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from src.infrastructure.template_helpers import render_template_with_translations

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
    return render_template_with_translations(
        templates=templates,
        template_name="home.html",
        request=request
    )


@router.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """
    Endpoint de verificación de salud de la aplicación.

    Returns:
        dict[str, str]: Estado de la aplicación
    """
    return {"status": "healthy", "message": "Roleplaying Characters Manager is running"}


@router.get("/debug/translations", tags=["Debug"])
async def debug_translations() -> dict:
    """
    Endpoint de debug para verificar el estado de las traducciones.
    
    Returns:
        dict: Información de debug sobre las traducciones
    """
    from src.infrastructure.translation_service import translation_service
    
    debug_info = {
        "translations_debug": translation_service.debug_translations_dir(),
        "available_domains": translation_service.get_available_domains(),
        "mo_files_check": {}
    }
    
    # Verificar archivos .mo específicos
    for lang in ["es", "en"]:
        for domain in ["home"]:
            debug_info["mo_files_check"][f"{lang}/{domain}"] = translation_service.debug_mo_file_exists(lang, domain)
    
    return debug_info
