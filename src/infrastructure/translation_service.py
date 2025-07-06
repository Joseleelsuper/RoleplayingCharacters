"""
Servicio de traducción dinámico para la aplicación.

Este módulo detecta automáticamente todos los archivos .po disponibles
y los compila a .mo de forma dinámica, permitiendo escalabilidad sin
modificar el código fuente.
"""

import gettext
from pathlib import Path
from typing import Dict, Union, List
from fastapi import Request
from src.infrastructure.i18n import I18nConfig
from babel.messages import Catalog
from babel.messages.pofile import read_po
from babel.messages.mofile import write_mo


def discover_po_files() -> Dict[str, List[Path]]:
    """
    Descubre dinámicamente todos los archivos .po organizados por idioma.

    Returns:
        Dict[str, List[Path]]: Diccionario con idioma -> lista de archivos .po
    """
    po_files_by_lang = {}

    for lang_dir in I18nConfig.TRANSLATIONS_DIR.iterdir():
        if lang_dir.is_dir() and lang_dir.name in I18nConfig.SUPPORTED_LANGUAGES:
            lang_code = lang_dir.name
            po_files = list(lang_dir.glob("*.po"))

            if po_files:
                po_files_by_lang[lang_code] = po_files

    return po_files_by_lang


def get_mo_path_for_po(po_file: Path) -> Path:
    """
    Obtiene la ruta del archivo .mo correspondiente a un archivo .po.

    Args:
        po_file: Ruta al archivo .po

    Returns:
        Path: Ruta donde debe estar el archivo .mo compilado
    """
    lang_dir = po_file.parent
    lc_messages_dir = lang_dir / "LC_MESSAGES"
    mo_filename = po_file.stem + ".mo"
    return lc_messages_dir / mo_filename


def compile_po_to_mo(po_file: Path, mo_file: Path) -> bool:
    """
    Compila un archivo .po a .mo usando Babel exclusivamente.

    Args:
        po_file: Ruta al archivo .po
        mo_file: Ruta al archivo .mo de destino

    Returns:
        bool: True si la compilación fue exitosa
    """
    try:
        # Crear directorio padre si no existe
        mo_file.parent.mkdir(parents=True, exist_ok=True)

        # Usar Babel para leer y escribir
        with open(po_file, "rb") as f:
            catalog = read_po(f)

        with open(mo_file, "wb") as f:
            write_mo(f, catalog)

        print(
            f"✓ Compilado {po_file.parent.name}/{po_file.stem}: {po_file.name} -> {mo_file.name}"
        )
        return True

    except Exception as e:
        print(f"✗ Error compilando {po_file} -> {mo_file}: {e}")

        # Crear archivo .mo vacío como fallback
        try:
            mo_file.parent.mkdir(parents=True, exist_ok=True)
            empty_catalog = Catalog()
            with open(mo_file, "wb") as f:
                write_mo(f, empty_catalog)
            return True
        except Exception:
            return False


class TranslationService:
    """Servicio dinámico para manejar las traducciones de la aplicación."""

    def __init__(self):
        self._translations: Dict[
            str, Dict[str, Union[gettext.GNUTranslations, gettext.NullTranslations]]
        ] = {}
        self._compiled_timestamps: Dict[str, Dict[str, float]] = {}
        self._domains: Dict[str, List[str]] = {}  # domain -> list of languages
        self._load_translations()

    def _discover_and_compile_translations(self) -> None:
        """Descubre y compila automáticamente todas las traducciones."""
        po_files_by_lang = discover_po_files()

        for lang_code, po_files in po_files_by_lang.items():
            if lang_code not in self._compiled_timestamps:
                self._compiled_timestamps[lang_code] = {}

            for po_file in po_files:
                domain = po_file.stem  # nombre del archivo sin extensión
                mo_file = get_mo_path_for_po(po_file)

                # Verificar si necesita recompilación
                po_mtime = po_file.stat().st_mtime
                last_compiled = self._compiled_timestamps[lang_code].get(domain, 0)

                needs_compile = (
                    not mo_file.exists()
                    or mo_file.stat().st_mtime < po_mtime
                    or last_compiled < po_mtime
                )

                if needs_compile:
                    if compile_po_to_mo(po_file, mo_file):
                        self._compiled_timestamps[lang_code][domain] = po_mtime

                # Registrar dominio
                if domain not in self._domains:
                    self._domains[domain] = []
                if lang_code not in self._domains[domain]:
                    self._domains[domain].append(lang_code)

    def _load_translations(self) -> None:
        """Carga dinámicamente todas las traducciones disponibles."""
        # Descubrir y compilar traducciones
        self._discover_and_compile_translations()

        # Limpiar traducciones existentes
        self._translations.clear()

        # Cargar traducciones para cada dominio y idioma
        for domain, languages in self._domains.items():
            for lang_code in languages:
                if lang_code not in self._translations:
                    self._translations[lang_code] = {}

                try:
                    # Usar el directorio translations directamente como localedir
                    # gettext busca en localedir/lang_code/LC_MESSAGES/domain.mo
                    localedir = str(I18nConfig.TRANSLATIONS_DIR)

                    translation = gettext.translation(
                        domain,
                        localedir=localedir,
                        languages=[lang_code],
                        fallback=True,
                    )

                    self._translations[lang_code][domain] = translation
                except Exception as e:
                    print(f"⚠ Error cargando traducción {lang_code}/{domain}: {e}")
                    self._translations[lang_code][domain] = gettext.NullTranslations()

    def reload_translations(self) -> None:
        """Recarga todas las traducciones. Útil durante el desarrollo."""
        self._load_translations()

    def get_translation(
        self,
        key: str,
        language: str = I18nConfig.DEFAULT_LANGUAGE,
        domain: str = "home",
    ) -> str:
        """
        Obtiene una traducción para una clave específica.

        Args:
            key: Clave de traducción
            language: Código de idioma
            domain: Dominio de traducción (nombre del archivo .po sin extensión)

        Returns:
            str: Texto traducido
        """
        if language not in self._translations:
            language = I18nConfig.DEFAULT_LANGUAGE

        if language not in self._translations:
            return key

        if domain not in self._translations[language]:
            # Intentar con el dominio 'home' como fallback
            domain = "home"
            if domain not in self._translations[language]:
                return key

        translation = self._translations[language][domain]
        translated = translation.gettext(key)

        # Devolver la traducción obtenida (puede ser la clave si no existe traducción)
        return translated

    def get_available_domains(self) -> List[str]:
        """
        Obtiene la lista de dominios de traducción disponibles.

        Returns:
            List[str]: Lista de dominios disponibles
        """
        return list(self._domains.keys())

    def get_language_from_request(self, request: Request) -> str:
        """
        Detecta el idioma preferido del usuario basado en la petición HTTP.

        Args:
            request: Objeto Request de FastAPI

        Returns:
            str: Código de idioma detectado
        """
        # Primero verificar si hay un parámetro de idioma en la URL
        lang = request.query_params.get("lang")
        if lang and lang in I18nConfig.SUPPORTED_LANGUAGES:
            return lang

        # Verificar el header Accept-Language
        accept_language = request.headers.get("accept-language")
        if accept_language:
            # Parsear el header Accept-Language básico
            languages = [
                lang.split(";")[0].strip()[:2] for lang in accept_language.split(",")
            ]
            for lang in languages:
                if lang in I18nConfig.SUPPORTED_LANGUAGES:
                    return lang

        return I18nConfig.DEFAULT_LANGUAGE


# Instancia global del servicio de traducción
translation_service = TranslationService()
