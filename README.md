# RoleplayingCharacters

Página web dedicada a la creación de personajes de rol, incluyendo varias razas, subrazas y clases de distintos juegos ya creados.

## Índice
- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Licencias](#licencias)

## Descripción

Permite a los usuarios crear personajes personalizados, ya sea utilizando clases y roles de juegos ya creados como clases personalizadas.

## Características

- Creación de personajes de rol.
- Selección de razas y subrazas.
- Selección de clases y subclases.
- Personalización de habilidades y atributos.
- Búsqueda y filtrado de personajes.

## Tecnologías utilizadas

- **Python** 3.13.1 para el desarrollo.
- **FastAPI** para el backend.
- **PostgreSQL** como base de datos.
- **SQLAlchemy** para la gestión de la base de datos.
- **Pydantic** para la validación de datos.
- **Alembic** para la migración de la base de datos.
- **pytest** para las pruebas unitarias.
- **httpx** para las pruebas de integración.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Joseleelsuper/RoleplayingCharacters.git
   ```

2. Navega al directorio del proyecto:
   ```bash
    cd RoleplayingCharacters
    ```

3. Crea un entorno virtual:
    - En Windows:
      ```bash
      python -m venv venv
      venv\Scripts\activate
      ```
    - En macOS/Linux:
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```

4. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

5. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

6. Ejecuta la aplicación:
   ```bash
   python run.py
   ```

   O alternativamente:
   ```bash
   uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
   ```

7. Abre tu navegador y ve a `http://localhost:8000` para ver la aplicación.

## Ejecución de pruebas

Para ejecutar las pruebas:

```bash
# Ejecutar todas las pruebas
pytest

# Ejecutar pruebas con verbose
pytest -v

# Ejecutar solo las pruebas de endpoints
pytest tests/test_endpoints.py
```

## Estructura del proyecto

```
RoleplayingCharacters/
├── src/
│   ├── domain/              # Entidades y lógica de dominio
│   ├── application/         # Casos de uso y lógica de aplicación
│   ├── infrastructure/      # Implementaciones específicas y endpoints
│   │   ├── web/            # Controladores HTTP
│   │   └── config.py       # Configuración de la aplicación
│   └── index.py             # Punto de entrada de la aplicación
├── tests/                  # Pruebas unitarias e integración
├── templates/              # Plantillas HTML (futuro)
├── requirements.txt        # Dependencias Python
├── run.py                 # Script de inicio
└── .env.example           # Ejemplo de variables de entorno
```

## Licencias

Este proyecto tiene 3 licencias y cada una se encarga de proteger diferentes aspectos del proyecto:
- **MIT License** en [LICENSE](/LICENSE): Protege el código fuente y permite su uso, modificación y distribución.
- **CC BY-NC-SA 4.0** en [LICENSE-CC-BY-SA](/LICENSE-CC-BY-SA): Protege a los personajes de los usuarios, su contenido y permite su uso no comercial, siempre que se atribuya al autor original y se comparta bajo la misma licencia.
- **OGL-1.0a** en [LICENSE-OGL](/LICENSE-OGL): Permite utilizar las razas estándar de los juegos de rol, como Dungeons & Dragons, y sus subrazas, siempre que se atribuya a Wizards of the Coast.

