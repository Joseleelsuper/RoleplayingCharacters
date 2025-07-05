"""
Script de inicio para la aplicación de gestión de personajes de rol.

Este script inicia el servidor de desarrollo usando uvicorn y proporciona
configuraciones específicas para el entorno de desarrollo.
"""

import os
import uvicorn


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

    uvicorn.run(
        "src.index:app",
        host="127.0.0.1",
        port=8000,
        reload=True,  # Recarga automática en desarrollo
        log_level="info",
    )


if __name__ == "__main__":
    main()
