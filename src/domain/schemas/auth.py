"""
Esquemas de autenticación para validación de datos de entrada.

Este módulo define los esquemas Pydantic para validar los datos de registro
y login, asegurando que cumplan con las reglas de seguridad establecidas.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re


class UserLoginRequest(BaseModel):
    """
    Esquema para validar solicitudes de login.
    
    Attributes:
        email: Email del usuario
        password: Contraseña del usuario
    """
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=8, max_length=128, description="Contraseña del usuario")

    class Config:
        """Configuración del modelo Pydantic."""
        str_strip_whitespace = True
        validate_assignment = True


class UserRegisterRequest(BaseModel):
    """
    Esquema para validar solicitudes de registro.
    
    Attributes:
        username: Nombre de usuario único
        email: Email del usuario
        password: Contraseña del usuario
        password2: Confirmación de contraseña
    """
    username: str = Field(..., min_length=3, max_length=50, description="Nombre de usuario")
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., min_length=8, max_length=128, description="Contraseña del usuario")
    password2: str = Field(..., min_length=8, max_length=128, description="Confirmación de contraseña")

    @validator('username')
    def validate_username(cls, v):
        """
        Valida que el nombre de usuario cumpla con los requisitos.
        
        Args:
            v: Valor del nombre de usuario
            
        Returns:
            str: Nombre de usuario validado
            
        Raises:
            ValueError: Si el nombre de usuario no cumple los requisitos
        """
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos')
        return v

    @validator('password')
    def validate_password(cls, v):
        """
        Valida que la contraseña cumpla con los requisitos de seguridad.
        
        Args:
            v: Valor de la contraseña
            
        Returns:
            str: Contraseña validada
            
        Raises:
            ValueError: Si la contraseña no cumple los requisitos
        """
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('La contraseña debe contener al menos una letra')
        
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        return v

    @validator('password2')
    def validate_password_match(cls, v, values):
        """
        Valida que las contraseñas coincidan.
        
        Args:
            v: Valor de la confirmación de contraseña
            values: Valores previamente validados
            
        Returns:
            str: Confirmación de contraseña validada
            
        Raises:
            ValueError: Si las contraseñas no coinciden
        """
        if 'password' in values and v != values['password']:
            raise ValueError('Las contraseñas no coinciden')
        return v

    class Config:
        """Configuración del modelo Pydantic."""
        str_strip_whitespace = True
        validate_assignment = True


class UserResponse(BaseModel):
    """
    Esquema de respuesta para datos de usuario (sin información sensible).
    
    Attributes:
        id: ID único del usuario
        username: Nombre de usuario
        email: Email del usuario
        created_at: Fecha de creación de la cuenta
    """
    id: str
    username: str
    email: str
    created_at: str

    class Config:
        """Configuración del modelo Pydantic."""
        from_attributes = True


class AuthResponse(BaseModel):
    """
    Esquema de respuesta para operaciones de autenticación exitosas.
    
    Attributes:
        success: Indica si la operación fue exitosa
        message: Mensaje descriptivo
        user: Datos del usuario (opcional)
        redirect_url: URL de redirección (opcional)
    """
    success: bool
    message: str
    user: Optional[UserResponse] = None
    redirect_url: Optional[str] = None


class AuthErrorResponse(BaseModel):
    """
    Esquema de respuesta para errores de autenticación.
    
    Attributes:
        success: Siempre False para errores
        message: Mensaje de error general
        errors: Errores específicos por campo (opcional)
    """
    success: bool = False
    message: str
    errors: Optional[dict] = None
