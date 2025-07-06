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
    
    @classmethod
    def get_translations_dir(cls) -> Path:
        """
        Obtiene la ruta absoluta correcta al directorio de traducciones.
        Compatible tanto con desarrollo local como con Vercel.
        """
        # En Vercel, el working directory puede ser diferente
        current_file = Path(__file__).resolve()
        project_root = current_file.parent.parent.parent
        translations_dir = project_root / "translations"
        
        # Si no existe en la ruta esperada, intentar rutas alternativas
        if not translations_dir.exists():
            # Intentar desde el directorio raíz actual
            alt_translations_dir = Path.cwd() / "translations"
            if alt_translations_dir.exists():
                return alt_translations_dir
            
            # Intentar ruta relativa desde src
            src_relative = current_file.parent.parent.parent / "translations"
            if src_relative.exists():
                return src_relative
        
        return translations_dir

    @classmethod
    def get_supported_locales(cls) -> List[Locale]:
        """
        Obtiene la lista de locales soportados.

        Returns:
            List[Locale]: Lista de objetos Locale soportados
        """
        return [Locale(lang) for lang in cls.SUPPORTED_LANGUAGES]

    @classmethod
    def get_mo_path(cls, lang: str, domain: str) -> Path:
        """
        Devuelve la ruta absoluta al archivo .mo para un idioma y dominio.
        """
        return cls.get_translations_dir() / lang / "LC_MESSAGES" / f"{domain}.mo"
