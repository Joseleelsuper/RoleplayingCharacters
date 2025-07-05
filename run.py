"""
Script de inicio para la aplicación de gestión de personajes de rol.

Este script inicia el servidor de desarrollo usando uvicorn y proporciona
configuraciones específicas para el entorno de desarrollo.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,  # Recarga automática en desarrollo
        log_level="info",
    )
