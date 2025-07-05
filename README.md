# RoleplayingCharacters

Página web dedicada a la creación de personajes de rol, incluyendo varias razas, subrazas y clases de distintos juegos ya creados.

## Índice
- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Instalación](#instalación)
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
      ```
    - En macOS/Linux:
      ```bash
      python3 -m venv venv
      ```

4. Activa el entorno virtual:
    - En Windows:
      ```bash
      venv\Scripts\activate
      ```
    - En macOS/Linux:
      ```bash
      source venv/bin/activate
      ```

5. Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```

6. Modifica el nombre del fichero `.env.example` a `.env` y configura las variables de entorno necesarias, como la conexión a la base de datos. Asegúrate de que el archivo `.env` esté en la raíz del proyecto.

7. Ejecuta las migraciones de la base de datos:
    ```bash
    alembic upgrade head
    ```

8. Inicia el servidor de desarrollo:
    ```bash
    uvicorn app.main:app --reload
    ```

## Licencias

Este proyecto tiene 3 licencias y cada una se encarga de proteger diferentes aspectos del proyecto:
- **MIT License** en [LICENSE](/LICENSE): Protege el código fuente y permite su uso, modificación y distribución.
- **CC BY-NC-SA 4.0** en [LICENSE-CC-BY-SA](/LICENSE-CC-BY-SA): Protege a los personajes de los usuarios, su contenido y permite su uso no comercial, siempre que se atribuya al autor original y se comparta bajo la misma licencia.
- **OGL-1.0a** en [LICENSE-OGL](/LICENSE-OGL): Permite utilizar las razas estándar de los juegos de rol, como Dungeons & Dragons, y sus subrazas, siempre que se atribuya a Wizards of the Coast.

