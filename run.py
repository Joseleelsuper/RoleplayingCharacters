"""
Script de inicio para la aplicación de gestión de personajes de rol.

Este script inicia el servidor de desarrollo usando uvicorn y proporciona
configuraciones específicas para el entorno de desarrollo.
"""

import uvicorn


def main():
    """
    Punto de entrada principal para iniciar el servidor de desarrollo.
    Configura el host, puerto y opciones de recarga automática.
    """

    uvicorn.run(
        "src.index:app",
        host="127.0.0.1",
        port=8000,
        reload=True,  # Recarga automática en desarrollo
        log_level="info",
    )


if __name__ == "__main__":
    main()
