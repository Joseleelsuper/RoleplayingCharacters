"""
Controlador de autenticación para endpoints de login y registro.

Este módulo maneja las operaciones de autenticación de usuarios,
utilizando los servicios de aplicación sin violar la arquitectura hexagonal.
"""

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import secrets

from src.domain.schemas.auth import (
    UserLoginRequest,
    UserRegisterRequest,
    AuthResponse,
    AuthErrorResponse,
    UserResponse
)
from src.application.auth_service import (
    auth_service,
    RegisterUserCommand,
    LoginUserCommand
)

router = APIRouter()


@router.post("/api/auth/register", response_model=AuthResponse, tags=["Auth"])
async def register_user(request: Request, user_data: UserRegisterRequest) -> JSONResponse:
    """
    Registra un nuevo usuario en el sistema.
    
    Args:
        request: Objeto Request de FastAPI
        user_data: Datos de registro validados
        
    Returns:
        JSONResponse: Respuesta con el resultado del registro
    """
    try:
        # Usar el servicio de aplicación para registro
        command = RegisterUserCommand(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password
        )
        
        success, message, user_dto = auth_service.register_user(command)
        
        if not success or user_dto is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content=AuthErrorResponse(
                    message=message,
                    errors={"general": [message]}
                ).model_dump()
            )
        
        # Crear respuesta de usuario
        user_response = UserResponse(
            id=user_dto.id,
            username=user_dto.username,
            email=user_dto.email,
            created_at=user_dto.created_at
        )
        
        # Configurar respuesta exitosa
        response_data = AuthResponse(
            success=True,
            message=message,
            user=user_response,
            redirect_url="/"
        )
        
        response = JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=response_data.model_dump()
        )
        
        # Establecer cookie de sesión segura
        session_token = secrets.token_urlsafe(32)
        
        # Crear sesión en el servicio
        auth_service.create_session(session_token, user_dto)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,  # Cambiar a True en producción con HTTPS
            samesite="lax",
            max_age=86400 * 30  # 30 días
        )
        
        return response
        
    except ValidationError as e:
        errors_dict = {}
        for error in e.errors():
            field = error.get("loc", ["unknown"])[-1]
            message = error.get("msg", "Error de validación")
            if field not in errors_dict:
                errors_dict[field] = []
            errors_dict[field].append(message)
            
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=AuthErrorResponse(
                message="Datos de entrada inválidos",
                errors=errors_dict
            ).model_dump()
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=AuthErrorResponse(
                message="Error interno del servidor"
            ).model_dump()
        )


@router.post("/api/auth/login", response_model=AuthResponse, tags=["Auth"])
async def login_user(request: Request, login_data: UserLoginRequest) -> JSONResponse:
    """
    Autentica un usuario existente.
    
    Args:
        request: Objeto Request de FastAPI
        login_data: Datos de login validados
        
    Returns:
        JSONResponse: Respuesta con el resultado del login
    """
    try:
        # Usar el servicio de aplicación para autenticación
        command = LoginUserCommand(
            email=login_data.email,
            password=login_data.password
        )
        
        success, message, user_dto = auth_service.authenticate_user(command)
        
        if not success or user_dto is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content=AuthErrorResponse(
                    message=message,
                    errors={"general": [message]}
                ).model_dump()
            )
        
        # Crear respuesta de usuario
        user_response = UserResponse(
            id=user_dto.id,
            username=user_dto.username,
            email=user_dto.email,
            created_at=user_dto.created_at
        )
        
        # Configurar respuesta exitosa
        response_data = AuthResponse(
            success=True,
            message=message,
            user=user_response,
            redirect_url="/"
        )
        
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data.model_dump()
        )
        
        # Establecer cookie de sesión segura
        session_token = secrets.token_urlsafe(32)
        
        # Crear sesión en el servicio
        auth_service.create_session(session_token, user_dto)
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,  # Cambiar a True en producción con HTTPS
            samesite="lax",
            max_age=86400 * 30  # 30 días
        )
        
        return response
        
    except ValidationError as e:
        errors_dict = {}
        for error in e.errors():
            field = error.get("loc", ["unknown"])[-1]
            message = error.get("msg", "Error de validación")
            if field not in errors_dict:
                errors_dict[field] = []
            errors_dict[field].append(message)
            
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=AuthErrorResponse(
                message="Datos de entrada inválidos",
                errors=errors_dict
            ).model_dump()
        )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=AuthErrorResponse(
                message="Error interno del servidor"
            ).model_dump()
        )


@router.post("/api/auth/logout", tags=["Auth"])
async def logout_user(request: Request) -> JSONResponse:
    """
    Cierra la sesión del usuario actual.
    
    Args:
        request: Objeto Request de FastAPI
        
    Returns:
        JSONResponse: Respuesta confirmando el logout
    """
    # Obtener token de sesión antes de eliminarlo
    session_token = request.cookies.get("session_token")
    
    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"success": True, "message": "Sesión cerrada exitosamente"}
    )
    
    # Destruir sesión en el servicio si existe
    if session_token:
        auth_service.destroy_session(session_token)
    
    # Eliminar cookie de sesión
    response.delete_cookie(key="session_token")
    
    return response


@router.get("/api/auth/user", response_model=UserResponse, tags=["Auth"])
async def get_current_user(request: Request) -> JSONResponse:
    """
    Obtiene la información del usuario autenticado actual.
    
    Args:
        request: Objeto Request de FastAPI
        
    Returns:
        JSONResponse: Información del usuario o error si no está autenticado
    """
    try:
        # Obtener token de sesión de las cookies
        session_token = request.cookies.get("session_token")
        
        if not session_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"success": False, "message": "No autenticado"}
            )
        
        # Obtener usuario por token de sesión
        user_dto = auth_service.get_user_by_session(session_token)
        
        if not user_dto:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"success": False, "message": "Sesión inválida"}
            )
        
        # Crear respuesta de usuario
        user_response = UserResponse(
            id=user_dto.id,
            username=user_dto.username,
            email=user_dto.email,
            created_at=user_dto.created_at
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=user_response.model_dump()
        )
        
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "message": "Error interno del servidor"}
        )
