"""
Helpers para templates de la aplicación.

Este módulo contiene funciones auxiliares que se pueden usar
en los templates de Jinja2 para simplificar tareas comunes.
"""

from typing import Callable
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
