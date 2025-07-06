from pathlib import Path
from fastapi import APIRouter
from fastapi.templating import Jinja2Templates

router = APIRouter()

# Configurar el directorio de templates
templates_dir = Path(__file__).parent.parent.parent.parent / "templates" / "html"
templates = Jinja2Templates(directory=str(templates_dir))


@router.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """
    Endpoint de verificación de salud de la aplicación.

    Returns:
        dict[str, str]: Estado de la aplicación
    """
    return {"status": "healthy", "message": "Roleplaying Characters Manager is running"}
