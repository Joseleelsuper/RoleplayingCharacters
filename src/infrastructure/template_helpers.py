"""
Helpers para templates de la aplicación.

Este módulo contiene funciones auxiliares que se pueden usar
en los templates de Jinja2 para simplificar tareas comunes.
"""

import os
from typing import Callable
from functools import wraps
from fastapi import Request
from fastapi.templating import Jinja2Templates
from src.infrastructure.translation_service import translation_service


def create_translation_function(language: str) -> Callable[[str, str], str]:
    """
    Crea una función de traducción para un idioma específico.

    Args:
        language: Código de idioma

    Returns:
        Callable: Función que traduce claves con dominio opcional
    """

    def translate(key: str, domain: str = "home") -> str:
        """
        Traduce una clave usando el idioma y dominio especificados.

        Args:
            key: Clave de traducción
            domain: Dominio de traducción (por defecto 'home')

        Returns:
            str: Texto traducido
        """
        return translation_service.get_translation(key, language, domain)

    return translate


def get_translation_context(language: str) -> dict:
    """
    Obtiene el contexto de traducción para usar en templates.

    Args:
        language: Código de idioma

    Returns:
        dict: Contexto con funciones de traducción
    """
    return {
        "_": create_translation_function(language),
        "language": language,
        "available_domains": translation_service.get_available_domains(),
    }


def render_template_with_translations(
    templates: Jinja2Templates,
    template_name: str,
    request: Request,
    context: dict | None = None,
):
    """
    Renderiza un template automáticamente con el contexto de traducción incluido.

    Args:
        templates: Instancia de Jinja2Templates
        template_name: Nombre del template a renderizar
        request: Request de FastAPI
        context: Contexto adicional para el template

    Returns:
        TemplateResponse con traducciones automáticamente incluidas
    """
    # Recargar traducciones en desarrollo
    if not os.getenv("VERCEL"):
        translation_service.reload_translations()

    # Detectar idioma
    language = translation_service.get_language_from_request(request)

    # Preparar contexto base
    base_context = {"request": request, **get_translation_context(language)}

    # Combinar con el contexto adicional
    if context:
        base_context.update(context)

    # Generar la respuesta con el template
    response = templates.TemplateResponse(template_name, base_context)

    return response


def with_translations(templates: Jinja2Templates, template_name: str):
    """
    Decorador que automatiza la inyección de traducciones en endpoints.

    Args:
        templates: Instancia de Jinja2Templates
        template_name: Nombre del template a renderizar

    Returns:
        Decorador que maneja automáticamente las traducciones
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # Ejecutar la función original
            result = await func(request, *args, **kwargs)

            # Si la función devuelve un dict, usarlo como contexto
            if isinstance(result, dict):
                context = result
            else:
                context = {}

            # Renderizar con traducciones
            return render_template_with_translations(
                templates=templates,
                template_name=template_name,
                request=request,
                context=context,
            )

        return wrapper

    return decorator
