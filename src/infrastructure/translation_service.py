"""
Servicio de traducción dinámico para la aplicación.

Este módulo detecta automáticamente todos los archivos .po disponibles
y los compila a .mo de forma dinámica.
"""
import gettext
from pathlib import Path
from typing import Any, Dict, Union, List
from fastapi import Request
from src.infrastructure.i18n import I18nConfig
from babel.messages import Catalog
from babel.messages.pofile import read_po
from babel.messages.mofile import write_mo


def get_absolute_translations_dir() -> Path:
    """
    Obtiene la ruta absoluta correcta al directorio de traducciones.
    Compatible tanto con desarrollo local como con Vercel.
    
    Returns:
        Path: Ruta absoluta al directorio de traducciones
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


def discover_po_files() -> Dict[str, List[Path]]:
    """
    Descubre dinámicamente todos los archivos .po organizados por idioma.

    Returns:
        Dict[str, List[Path]]: Diccionario con idioma -> lista de archivos .po
    """
    po_files_by_lang = {}
    translations_dir = get_absolute_translations_dir()
    
    if not translations_dir.exists():
        print(f"⚠️  Directorio de traducciones no encontrado: {translations_dir}")
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
    Compila un archivo .po a .mo usando Babel exclusivamente.

    Args:
        po_file: Ruta al archivo .po
        mo_file: Ruta al archivo .mo de destino

    Returns:
        bool: True si la compilación fue exitosa
    """
    try:
        # En Vercel, evitar crear directorios si es read-only
        if not mo_file.parent.exists():
            try:
                mo_file.parent.mkdir(parents=True, exist_ok=True)
            except (OSError, PermissionError) as e:
                print(f"⚠️  No se pudo crear directorio {mo_file.parent}: {e}")
                return False

        # Usar Babel para leer y escribir
        with open(po_file, "rb") as f:
            catalog = read_po(f)

        with open(mo_file, "wb") as f:
            write_mo(f, catalog)

        print(f"✓ Compilado {po_file.parent.name}/{po_file.stem}: {po_file.name} -> {mo_file.name}")
        return True

    except Exception as e:
        print(f"✗ Error compilando {po_file} -> {mo_file}: {e}")

        # En caso de error, crear archivo .mo vacío como fallback
        try:
            if mo_file.parent.exists():
                empty_catalog = Catalog()
                with open(mo_file, "wb") as f:
                    write_mo(f, empty_catalog)
                print(f"⚠️  Creado archivo .mo vacío como fallback: {mo_file}")
                return True
        except Exception:
            pass
            
        return False


class TranslationService:
    """Servicio dinámico para manejar las traducciones de la aplicación."""

    def __init__(self):
        self._translations: Dict[str, Dict[str, Union[gettext.GNUTranslations, gettext.NullTranslations]]] = {}
        self._compiled_timestamps: Dict[str, Dict[str, float]] = {}
        self._domains: Dict[str, List[str]] = {}  # domain -> list of languages
        self._translations_dir = get_absolute_translations_dir()
        self._load_translations()

    def _discover_and_compile_translations(self) -> None:
        """Descubre y compila automáticamente todas las traducciones."""
        po_files_by_lang = discover_po_files()

        for lang_code, po_files in po_files_by_lang.items():
            if lang_code not in self._compiled_timestamps:
                self._compiled_timestamps[lang_code] = {}

            for po_file in po_files:
                domain = po_file.stem
                mo_file = get_mo_path_for_po(po_file)
                
                # Registrar dominio
                if domain not in self._domains:
                    self._domains[domain] = []
                if lang_code not in self._domains[domain]:
                    self._domains[domain].append(lang_code)

                # Verificar si necesita compilación
                try:
                    po_mtime = po_file.stat().st_mtime
                    should_compile = True
                    
                    if mo_file.exists():
                        mo_mtime = mo_file.stat().st_mtime
                        cached_mtime = self._compiled_timestamps[lang_code].get(domain, 0)
                        
                        # Solo compilar si el .po es más nuevo que el .mo o si no está en caché
                        if mo_mtime >= po_mtime and cached_mtime == po_mtime:
                            should_compile = False
                    
                    if should_compile:
                        if compile_po_to_mo(po_file, mo_file):
                            self._compiled_timestamps[lang_code][domain] = po_mtime
                        
                except (OSError, PermissionError) as e:
                    print(f"⚠️  Error accediendo a archivo {po_file}: {e}")

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

                mo_file = self._translations_dir / lang_code / "LC_MESSAGES" / f"{domain}.mo"
                
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
