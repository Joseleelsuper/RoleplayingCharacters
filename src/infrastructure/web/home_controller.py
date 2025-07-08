"""
Controlador para endpoints relacionados con la página principal.

Este módulo contiene los endpoints HTTP para la funcionalidad básica
de la aplicación, incluyendo la página de inicio y verificaciones de salud.
"""

from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from infrastructure.i18n import I18nConfig
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
    response = render_template_with_translations(
        templates=templates, template_name="home.html", request=request
    )
    
    selected_lang = request.query_params.get("lang")
    if selected_lang and selected_lang in I18nConfig.SUPPORTED_LANGUAGES:
        response.set_cookie(
            key=I18nConfig.LANGUAGE_COOKIE_NAME,
            value=selected_lang,
            max_age=I18nConfig.LANGUAGE_COOKIE_MAX_AGE,
            httponly=True,
            samesite="lax"
        )
    
    return response
