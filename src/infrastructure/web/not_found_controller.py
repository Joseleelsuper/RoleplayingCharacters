from pathlib import Path
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from src.infrastructure.template_helpers import render_template_with_translations

router = APIRouter()

# Configurar el directorio de templates
templates_dir = Path(__file__).parent.parent.parent.parent / "templates" / "html"
templates = Jinja2Templates(directory=str(templates_dir))

@router.get("/404", response_class=HTMLResponse, tags=["NotFound"])
async def not_found(request: Request) -> HTMLResponse:
    """
    Endpoint para la página 404 personalizada.

    Args:
        request: Objeto Request de FastAPI para detectar el idioma

    Returns:
        HTMLResponse: HTML con la página 404 traducida
    """
    # Forzar el dominio de traducción a '404'
    return render_template_with_translations(
        templates=templates, template_name="404.html", request=request, context={"_domain": "404"}
    )
