"""
Controlador para endpoints relacionados con la página principal.

Este módulo contiene los endpoints HTTP para la funcionalidad básica
de la aplicación, incluyendo la página de inicio y verificaciones de salud.
"""

from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter()

# Configurar el directorio de templates
templates_dir = Path(__file__).parent.parent.parent.parent / "templates" / "html"
templates = Jinja2Templates(directory=str(templates_dir))


@router.get("/", response_class=HTMLResponse, tags=["Home"])
async def get_home_page() -> str:
    """
    Endpoint que devuelve la página principal de la aplicación.

    Returns:
        str: HTML con la página de inicio
    """
    with open(templates_dir / "home.html", "r", encoding="utf-8") as file:
        return file.read()


@router.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """
    Endpoint de verificación de salud de la aplicación.

    Returns:
        dict[str, str]: Estado de la aplicación
    """
    return {"status": "healthy", "message": "Roleplaying Characters Manager is running"}
