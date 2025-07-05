"""
Pruebas de integración para los endpoints de la aplicación.

Este módulo contiene pruebas para verificar que los endpoints HTTP
funcionan correctamente y devuelven las respuestas esperadas.
"""

from fastapi.testclient import TestClient

from index import app

client = TestClient(app)


class TestHomeEndpoints:
    """Pruebas para los endpoints de la página principal."""

    def test_get_home_page_returns_200(self) -> None:
        """
        Prueba que el endpoint principal devuelve código 200.
        """
        response = client.get("/")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    def test_home_page_contains_hello_world(self) -> None:
        """
        Prueba que la página principal contiene el texto "Hola Mundo".
        """
        response = client.get("/")
        assert "¡Hola Mundo!" in response.text
        assert "Bienvenido al Gestor de Personajes de Rol" in response.text

    def test_health_check_returns_healthy_status(self) -> None:
        """
        Prueba que el endpoint de salud devuelve estado saludable.
        """
        response = client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "Roleplaying Characters Manager" in data["message"]
