"""
Punto de entrada principal de la aplicación FastAPI.

Este módulo configura la aplicación FastAPI principal con todas las rutas,
middleware y configuraciones necesarias para ejecutar la aplicación web
de gestión de personajes de rol.
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from src.infrastructure.config import settings
from src.infrastructure.web.home_controller import router as home_router

app = FastAPI(
    title=settings.app_name,
    description="Aplicación web para crear y gestionar personajes de rol",
    version=settings.app_version,
    # docs_url="/docs",
    # redoc_url="/redoc",
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(home_router, prefix="", tags=["Home"])

# Configurar archivos estáticos solo en desarrollo
if not os.getenv("VERCEL"):
    static_dir = Path(__file__).parent.parent / "templates"
    app.mount("/css", StaticFiles(directory=str(static_dir / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(static_dir / "js")), name="js")
    app.mount("/img", StaticFiles(directory=str(static_dir / "img")), name="img")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
