"""
Script de inicio para la aplicación de gestión de personajes de rol.

Este script inicia el servidor de desarrollo usando uvicorn y proporciona
configuraciones específicas para el entorno de desarrollo.
"""

import os
import sys
import uvicorn
from pathlib import Path

# Agregar src al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.infrastructure.translation_service import discover_po_files, compile_po_to_mo, get_mo_path_for_po


def compile_translations():
    """
    Compila todas las traducciones .po a .mo en desarrollo local.
    """
    print("🔄 Compilando traducciones...")
    
    po_files_by_lang = discover_po_files()
    
    if not po_files_by_lang:
        print("⚠️  No se encontraron archivos .po para compilar")
        return
    
    compiled_count = 0
    
    for lang_code, po_files in po_files_by_lang.items():
        for po_file in po_files:
            mo_file = get_mo_path_for_po(po_file)
            
            # Verificar si necesita compilación
            should_compile = True
            if mo_file.exists():
                po_mtime = po_file.stat().st_mtime
                mo_mtime = mo_file.stat().st_mtime
                should_compile = po_mtime > mo_mtime
            
            if should_compile:
                compile_po_to_mo(po_file, mo_file)
                compiled_count += 1
    
    print(f"✅ Compilación completada: {compiled_count} archivos compilados")


def main():
    """
    Punto de entrada principal para iniciar el servidor de desarrollo.
    Configura el host, puerto y opciones de recarga automática.
    """
    try:
        os.system("lint-imports")
    except Exception as e:
        print(f"ERROR al ejecutar lint-imports: {e}")
        print("Continuando con la ejecución...")

    # Compilar traducciones antes de iniciar el servidor
    compile_translations()

    uvicorn.run(
        "src.index:app",
        host="127.0.0.1",
        port=8000,
        reload=True,  # Recarga automática en desarrollo
        log_level="info",
    )


if __name__ == "__main__":
    main()
