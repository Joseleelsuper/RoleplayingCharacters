"""
Configuración de internacionalización para la aplicación.

Este módulo contiene la configuración necesaria para el soporte de múltiples idiomas
usando Babel y starlette-babel.
"""

from pathlib import Path
from typing import List
from babel import Locale


class I18nConfig:
    """Configuración de internacionalización."""

    DEFAULT_LANGUAGE: str = "es"
    SUPPORTED_LANGUAGES: List[str] = ["es", "en"]
    TRANSLATIONS_DIR: Path = Path(__file__).parent.parent.parent / "translations"

    @classmethod
    def get_supported_locales(cls) -> List[Locale]:
        """
        Obtiene la lista de locales soportados.

        Returns:
            List[Locale]: Lista de objetos Locale soportados
        """
        return [Locale(lang) for lang in cls.SUPPORTED_LANGUAGES]
