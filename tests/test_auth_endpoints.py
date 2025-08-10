"""
Tests para los endpoints de autenticación.

Este módulo contiene pruebas para verificar que los endpoints de registro
y login funcionan correctamente y manejan la validación de datos.
"""

from fastapi.testclient import TestClient


def test_register_endpoint_valid_data(client: TestClient):
    """
    Prueba el endpoint de registro con datos válidos.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    register_data = {
        "username": "testuser123",
        "email": "test@example.com",
        "password": "testpass123",
        "password2": "testpass123"
    }
    
    response = client.post("/api/auth/register", json=register_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "Usuario registrado exitosamente" in data["message"]
    assert data["user"]["username"] == "testuser123"
    assert data["user"]["email"] == "test@example.com"
    assert "password" not in data["user"]  # No debe incluir datos sensibles


def test_register_endpoint_password_mismatch(client: TestClient):
    """
    Prueba el endpoint de registro con contraseñas que no coinciden.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    register_data = {
        "username": "testuser123",
        "email": "test@example.com",
        "password": "testpass123",
        "password2": "different_password"
    }
    
    response = client.post("/api/auth/register", json=register_data)
    
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "password2" in data["errors"]


def test_register_endpoint_invalid_email(client: TestClient):
    """
    Prueba el endpoint de registro con email inválido.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    register_data = {
        "username": "testuser123",
        "email": "invalid-email",
        "password": "testpass123",
        "password2": "testpass123"
    }
    
    response = client.post("/api/auth/register", json=register_data)
    
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_register_endpoint_weak_password(client: TestClient):
    """
    Prueba el endpoint de registro con contraseña débil.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    register_data = {
        "username": "testuser123",
        "email": "test@example.com",
        "password": "weak",  # Muy corta
        "password2": "weak"
    }
    
    response = client.post("/api/auth/register", json=register_data)
    
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_login_endpoint_valid_credentials(client: TestClient):
    """
    Prueba el endpoint de login con credenciales válidas.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Login exitoso" in data["message"]
    assert data["user"]["email"] == "test@example.com"


def test_login_endpoint_invalid_credentials(client: TestClient):
    """
    Prueba el endpoint de login con credenciales inválidas.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", json=login_data)
    
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert "Credenciales inválidas" in data["message"]


def test_login_endpoint_missing_data(client: TestClient):
    """
    Prueba el endpoint de login con datos faltantes.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    login_data = {
        "email": "test@example.com"
        # password faltante
    }
    
    response = client.post("/api/auth/login", json=login_data)
    
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_logout_endpoint(client: TestClient):
    """
    Prueba el endpoint de logout.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    response = client.post("/api/auth/logout")
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Sesión cerrada" in data["message"]


def test_auth_pages_render_correctly(client: TestClient):
    """
    Prueba que las páginas de autenticación se rendericen correctamente.
    
    Args:
        client: Cliente de pruebas de FastAPI
    """
    # Prueba página de login
    response = client.get("/login")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    
    # Prueba página de registro
    response = client.get("/register")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
