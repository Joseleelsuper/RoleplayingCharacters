"""
Configuración de tests: expone `index` como alias de `src.index` para compatibilidad.
"""

import importlib
import sys

# Hacer que `from index import app` funcione en los tests
sys.modules["index"] = importlib.import_module("src.index")
