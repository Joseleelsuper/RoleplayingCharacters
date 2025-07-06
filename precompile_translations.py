#!/usr/bin/env python3
"""
Script de pre-compilación para asegurar que los archivos .mo
estén disponibles antes del deployment en Vercel.
"""

import sys
from pathlib import Path

# Agregar src al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.infrastructure.translation_service import discover_po_files, compile_po_to_mo, get_mo_path_for_po


def precompile_translations():
    """
    Pre-compila todas las traducciones encontradas.
    """
    print("🔄 Iniciando pre-compilación de traducciones...")
    
    po_files_by_lang = discover_po_files()
    
    if not po_files_by_lang:
        print("⚠️  No se encontraron archivos .po para compilar")
        return False
    
    success = True
    compiled_count = 0
    
    for lang_code, po_files in po_files_by_lang.items():
        print(f"\n📁 Procesando idioma: {lang_code}")
        
        for po_file in po_files:
            mo_file = get_mo_path_for_po(po_file)
            
            print(f"   🔄 Compilando: {po_file.name} -> {mo_file.name}")
            
            if compile_po_to_mo(po_file, mo_file):
                compiled_count += 1
            else:
                print(f"   ❌ Error compilando: {po_file}")
                success = False
    
    print(f"\n✅ Pre-compilación completada: {compiled_count} archivos compilados")
    return success


if __name__ == "__main__":
    success = precompile_translations()
    sys.exit(0 if success else 1)
