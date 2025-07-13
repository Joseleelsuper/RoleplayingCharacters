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
from src.infrastructure.i18n import I18nConfig


def create_translation_function(language: str, domain: str = "home") -> Callable[[str, str | None], str]:
    """
    Crea una función de traducción para un idioma y dominio específico.

    Args:
        language: Código de idioma
        domain: Dominio de traducción por defecto

    Returns:
        Callable: Función que traduce claves con dominio opcional
    """

    def translate(key: str, forced_domain: str | None = None) -> str:
        """
        Traduce una clave usando el idioma y dominio especificados.

        Args:
            key: Clave de traducción
            forced_domain: Dominio de traducción específico para esta traducción (opcional)

        Returns:
            str: Texto traducido
        """
        # Asegurarnos de que translation_service esté completamente inicializado
        if not hasattr(translation_service, '_translations') or not translation_service._translations:
            translation_service.reload_translations()
            
        result = translation_service.get_translation(key, language, forced_domain or domain)
        # Si la traducción falló (devolvió la misma clave), registrar para debug
        if result == key:
            print(f"❌ Traducción fallida para '{key}' en {language}/{forced_domain or domain}")
        return result

    return translate


def get_translation_context(language: str, domain: str = "home") -> dict:
    """
    Obtiene el contexto de traducción para usar en templates.

    Args:
        language: Código de idioma
        domain: Dominio de traducción por defecto

    Returns:
        dict: Contexto con funciones de traducción
    """
    def url_for(name: str, **path_params) -> str:
        """
        Genera URLs para rutas nombradas.
        
        Args:
            name: Nombre de la ruta
            **path_params: Parámetros de la ruta
            
        Returns:
            str: URL generada
        """
        # Mapeo de nombres de ruta a paths
        route_map = {
            "home": "/",
            "create_character": "/create-character",
            "character_detail": "/character/{character_id}",
            "browse_characters": "/browse",
            "user_characters": "/characters",
            "help": "/help",
            "contact": "/contact",
            "feedback": "/feedback",
            "privacy": "/privacy",
            "terms": "/terms",
        }
        
        if name not in route_map:
            return f"/{name}"  # Fallback
            
        url = route_map[name]
        
        # Reemplazar parámetros de path
        for param, value in path_params.items():
            url = url.replace(f"{{{param}}}", str(value))
            
        return url
    
    return {
        "_": create_translation_function(language, domain),
        "_header": create_translation_function(language, "header"),
        "_footer": create_translation_function(language, "footer"),
        "language": language,
        "available_domains": translation_service.get_available_domains(),
        "get_locale": lambda: language,
        "url_for": url_for,
    }


def get_lang_query(request: Request, default: str = I18nConfig.DEFAULT_LANGUAGE) -> str:
    """
    Devuelve el query string de idioma actual para mantenerlo en los enlaces.
    Solo añade el parámetro lang si es diferente al idioma guardado en la cookie
    o al idioma por defecto si no hay cookie.
    """
    lang = translation_service.get_language_from_request(request)
    
    # Verificar si ya existe una cookie con el mismo idioma
    cookie_lang = request.cookies.get(I18nConfig.LANGUAGE_COOKIE_NAME)
    
    # Si el idioma seleccionado es igual al de la cookie o al por defecto (si no hay cookie), 
    # no incluir el parámetro en los enlaces
    if (cookie_lang and lang == cookie_lang) or (not cookie_lang and lang == default):
        return ""
        
    return f"?lang={lang}"


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
    # Permitir forzar dominio desde el contexto
    domain = context.get("_domain", "home") if context else "home"
    # Guardar el parámetro lang para enlaces
    lang_query = get_lang_query(request)
    # Preparar contexto base
    base_context = {"request": request, **get_translation_context(language, domain), "lang_query": lang_query, "current_lang": language}

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
