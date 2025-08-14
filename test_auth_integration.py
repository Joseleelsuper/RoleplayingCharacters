"""
Script de prueba para verificar la integración del servicio de autenticación con PostgreSQL.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.application.auth_service import AuthenticationService
from src.contracts import RegisterUserCommand, LoginUserCommand

async def test_auth_integration():
    """Prueba la integración completa del servicio de autenticación."""
    print("🚀 Iniciando pruebas de integración del servicio de autenticación")
    
    # Crear instancia del servicio
    auth_service = AuthenticationService()
    
    # Datos de prueba
    test_email = "test_integration@example.com"
    test_username = "test_user_integration"
    test_password = "test_password_123"
    
    print(f"📝 Registrando usuario: {test_email}")
    
    # Probar registro
    register_command = RegisterUserCommand(
        email=test_email,
        username=test_username,
        password=test_password
    )
    
    try:
        result = auth_service.register_user(register_command)
        if result.success:
            print(f"✅ Usuario registrado exitosamente. Token: {result.token}")
        else:
            print(f"❌ Error en registro: {result.message}")
            return
    except Exception as e:
        print(f"❌ Excepción durante registro: {e}")
        return
    
    print(f"🔐 Intentando login con usuario: {test_email}")
    
    # Probar login
    login_command = LoginUserCommand(
        email=test_email,
        password=test_password
    )
    
    try:
        login_result = auth_service.login_user(login_command)
        if login_result.success:
            print(f"✅ Login exitoso. Token: {login_result.token}")
        else:
            print(f"❌ Error en login: {login_result.message}")
    except Exception as e:
        print(f"❌ Excepción durante login: {e}")
    
    print("🏁 Pruebas de integración completadas")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_auth_integration())
