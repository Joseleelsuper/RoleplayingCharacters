"""
Servicio de traducción para la aplicación.

Este módulo carga los archivos .mo precompilados para proporcionar
traducciones dinámicas según el idioma del usuario.
En desarrollo local, compila automáticamente los archivos .po a .mo.
"""

import gettext
from pathlib import Path
from typing import Any, Dict, Union, List
from fastapi import Request
from src.infrastructure.i18n import I18nConfig


def get_absolute_translations_dir() -> Path:
    """
    Obtiene la ruta absoluta correcta al directorio de traducciones.
    Compatible tanto con desarrollo local como con Vercel.

    Returns:
        Path: Ruta absoluta al directorio de traducciones
    """
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


def discover_po_files() -> Dict[str, List[Path]]:
    """
    Descubre dinámicamente todos los archivos .po organizados por idioma.
    Solo usado en desarrollo local para compilación.

    Returns:
        Dict[str, List[Path]]: Diccionario con idioma -> lista de archivos .po
    """
    po_files_by_lang = {}
    translations_dir = get_absolute_translations_dir()

    if not translations_dir.exists():
        return po_files_by_lang

    for lang_dir in translations_dir.iterdir():
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
    Compila un archivo .po a .mo usando Babel.
    Solo funciona en desarrollo local.

    Args:
        po_file: Ruta al archivo .po
        mo_file: Ruta al archivo .mo de destino

    Returns:
        bool: True si la compilación fue exitosa
    """
    from babel.messages.pofile import read_po
    from babel.messages.mofile import write_mo

    # Crear directorio si no existe
    if not mo_file.parent.exists():
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


def discover_mo_files() -> Dict[str, List[Path]]:
    """
    Descubre dinámicamente todos los archivos .mo organizados por idioma.

    Returns:
        Dict[str, List[Path]]: Diccionario con idioma -> lista de archivos .mo
    """
    mo_files_by_lang = {}
    translations_dir = get_absolute_translations_dir()

    if not translations_dir.exists():
        print(f"⚠️  Directorio de traducciones no encontrado: {translations_dir}")
        return mo_files_by_lang

    for lang_dir in translations_dir.iterdir():
        if lang_dir.is_dir() and lang_dir.name in I18nConfig.SUPPORTED_LANGUAGES:
            lang_code = lang_dir.name
            lc_messages_dir = lang_dir / "LC_MESSAGES"

            if lc_messages_dir.exists():
                mo_files = list(lc_messages_dir.glob("*.mo"))
                if mo_files:
                    mo_files_by_lang[lang_code] = mo_files

    return mo_files_by_lang


class TranslationService:
    """Servicio para manejar las traducciones de la aplicación."""

    def __init__(self):
        self._translations: Dict[
            str, Dict[str, Union[gettext.GNUTranslations, gettext.NullTranslations]]
        ] = {}
        self._domains: Dict[str, List[str]] = {}  # domain -> list of languages
        self._translations_dir = get_absolute_translations_dir()
        self._load_translations()

    def _discover_and_compile_translations(self) -> None:
        """Descubre y compila automáticamente todas las traducciones en desarrollo local."""
        po_files_by_lang = discover_po_files()

        for lang_code, po_files in po_files_by_lang.items():
            for po_file in po_files:
                domain = po_file.stem
                mo_file = get_mo_path_for_po(po_file)

                # Registrar dominio
                if domain not in self._domains:
                    self._domains[domain] = []
                if lang_code not in self._domains[domain]:
                    self._domains[domain].append(lang_code)

                # Verificar si necesita compilación
                should_compile = True
                if mo_file.exists():
                    po_mtime = po_file.stat().st_mtime
                    mo_mtime = mo_file.stat().st_mtime
                    should_compile = po_mtime > mo_mtime

                if should_compile:
                    compile_po_to_mo(po_file, mo_file)

    def _discover_translations(self) -> None:
        """Descubre automáticamente todas las traducciones disponibles."""
        mo_files_by_lang = discover_mo_files()

        for lang_code, mo_files in mo_files_by_lang.items():
            for mo_file in mo_files:
                domain = mo_file.stem

                # Registrar dominio
                if domain not in self._domains:
                    self._domains[domain] = []
                if lang_code not in self._domains[domain]:
                    self._domains[domain].append(lang_code)

    def _load_translations(self) -> None:
        """Carga todas las traducciones disponibles."""
        # Compilar traducciones siempre, para asegurar que estén actualizadas
        # Esto es crítico tanto en desarrollo como en producción
        self._discover_and_compile_translations()
        
        print(f"📚 Cargando traducciones desde: {self._translations_dir}")

        # En Vercel/producción solo descubrir y cargar .mo existentes
        self._discover_translations()

        # Limpiar traducciones existentes
        self._translations.clear()

        # Cargar traducciones para cada dominio y idioma
        for domain, languages in self._domains.items():
            for lang_code in languages:
                if lang_code not in self._translations:
                    self._translations[lang_code] = {}

                mo_file = (
                    self._translations_dir / lang_code / "LC_MESSAGES" / f"{domain}.mo"
                )

                try:
                    if mo_file.exists():
                        with open(mo_file, "rb") as f:
                            translation = gettext.GNUTranslations(f)
                    else:
                        print(f"⚠️  Archivo .mo no encontrado: {mo_file}")
                        translation = gettext.NullTranslations()

                    self._translations[lang_code][domain] = translation

                except Exception as e:
                    print(f"✗ Error cargando traducción {lang_code}/{domain}: {e}")
                    self._translations[lang_code][domain] = gettext.NullTranslations()

    def reload_translations(self) -> None:
        """Recarga todas las traducciones. Útil durante el desarrollo."""
        try:
            self._load_translations()
        except Exception as e:
            print(f"[WARN] Error recargando traducciones: {e}")

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
        try:
            if language not in self._translations:
                language = I18nConfig.DEFAULT_LANGUAGE

            if language not in self._translations:
                print(f"⚠️ No hay traducciones cargadas para el idioma: {language}")
                return key

            if domain not in self._translations[language]:
                # Intentar con el dominio 'home' como fallback
                print(f"⚠️ Dominio '{domain}' no disponible para {language}, usando 'home'")
                domain = "home"
                if domain not in self._translations[language]:
                    print(f"⚠️ Dominio fallback 'home' no disponible para {language}")
                    return key

            translation = self._translations[language][domain]
            translated = translation.gettext(key)
            
            # Si la traducción es igual a la clave, intentar con dominio fallback
            if translated == key and domain != "home":
                fallback_translation = self._translations[language].get("home")
                if fallback_translation:
                    fallback_result = fallback_translation.gettext(key)
                    if fallback_result != key:
                        return fallback_result
            
            # Devolver la traducción obtenida (puede ser la clave si no existe traducción)
            return translated
        except Exception as e:
            print(f"🚨 Error al traducir '{key}': {e}")
            return key

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

        # Verificar si hay una cookie de idioma
        cookie_lang = request.cookies.get(I18nConfig.LANGUAGE_COOKIE_NAME)
        if cookie_lang and cookie_lang in I18nConfig.SUPPORTED_LANGUAGES:
            return cookie_lang

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

    def debug_mo_file_exists(self, lang: str, domain: str) -> bool:
        """
        Comprueba si el archivo .mo existe en la ruta esperada (útil para debug en Vercel).
        """
        mo_path = self._translations_dir / lang / "LC_MESSAGES" / f"{domain}.mo"
        exists = mo_path.exists()
        print(f"🔍 Debug - {lang}/{domain}.mo exists: {exists} (path: {mo_path})")
        return exists

    def debug_translations_dir(self) -> Dict[str, Any]:
        """
        Información de debug sobre el directorio de traducciones.
        """
        info = {
            "translations_dir": str(self._translations_dir),
            "dir_exists": self._translations_dir.exists(),
            "available_domains": self.get_available_domains(),
            "loaded_languages": list(self._translations.keys()),
        }

        if self._translations_dir.exists():
            info["dir_contents"] = [str(p) for p in self._translations_dir.iterdir()]

        return info


# Instancia global del servicio de traducción
translation_service = TranslationService()
