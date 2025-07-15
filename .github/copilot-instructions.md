## Descripción del proyecto

Página web hosteada en Vercel que permite a los usuarios crear y gestionar personajes de rol. Los usuarios pueden registrarse, iniciar sesión, crear personajes, editar sus atributos y habilidades, y compartirlos con otros usuarios. La aplicación está diseñada para ser intuitiva y fácil de usar, con un enfoque en la personalización de los personajes. Se utilizan clases y razas de personajes tanto creados por juegos de rol preestablecidos como personalizados por los usuarios.

## Instrucciones de estructura y convenciones

1. Tanto nombre de variables, funciones, clases y ficheros deben estar en inglés. Documentación de funciones y clases en español.

2. Cuando te pregunte algo, respóndeme en español si no rompe la regla anterior.

3. Programamos en Python completamente tipado.

4. Usamos FastAPI con PostgreSQL.

5. Usamos el patrón repositorio para separar lógica de persistencia de nuestra lógica de negocio.

6. Usamos casos de uso, encapsulamos acciones sobre dominio en clases que tienen un método `execute` que recibe una `dataclass` con los argumentos de ejecución. Estos casos de uso reciben inyectadas las dependencias como pueden ser los repositorios.

7. Usamos objetos de dominio separados de las entidades de datos de la base de datos. El mapeo entre ambas entidades ocurre en el repositorio.

8. Tenemos varias capas:
    - **Dominio**: Donde creamos las entidades.
    - **Aplicación**: Donde creamos los casos de uso.
    - **Infraestructura**: Donde creamos los endpoints y las implementaciones específicas de las abstracciones como pueden ser los repositorios.

9. Para las pruebas unitarias usamos `pytest` y `pytest-asyncio`. Las pruebas de integración las hacemos con `pytest` y `httpx`.

10. Para la comprobación de la estructura del código, tenemos un fichero `.importLinter` de la dependencia `import-linter` para la comprobación de la estructura del código. Este fichero contiene las reglas de importación que queremos aplicar en nuestro proyecto.

11. El mensaje de los commits debe añadir el prefijo de los commits convencionales junto a su emoji y una explicación detallada pero fácil de leer para su futura revisión.

12. A la hora de necesitar añadir nuevas dependencias en el fichero `requirements.txt`, no instalarlas. Suponer que ya están instaladas en el entorno.

13. En caso de necesitar añadir variables de entorno, hacerlos en el `.env.example`.

14. No añadas `import` ni `from x`. Supón que ya están importados el nuevo contenido que añadas a un fichero, a no ser que sea un fichero vacío.

15. Todo comentario explicativo no lo pongas, es decir, solo quiero comentarios sobre lo que hace una parte en concreto del código si es difícil de entender.

16. Para la traducción, utilizamos Babel y `starlette-babel`. Queremos hacer las traducciones mantenibles, por lo que habrá distintos ficheros para cada página.

17. Si no te lo he pedido explícitamente, NO LO HAGAS. No quiero que añadas cosas extra simplemente por la cara. Pregunta antes de programar.

18. En `/templates/css/global/base.css` y `colors.css` tenemos todos los estilos por defecto. No utilices estilos no necesarios en los CSS de las páginas. Utiliza los estilos ya creados en estos ficheros.

## Flujos de trabajo críticos

### Ejecución de pruebas

Para ejecutar las pruebas:

```bash
# Ejecutar todas las pruebas
pytest

# Ejecutar pruebas con verbose
pytest -v

# Ejecutar solo las pruebas de endpoints
pytest tests/test_endpoints.py
```

### Estructura de traducciones

Las traducciones están organizadas en `/translations` con subdirectorios por idioma (`en`, `es`). Cada página tiene su propio archivo `.po` y `.mo` para mantener las traducciones.

### Estilo y diseño

Los estilos globales están en `/templates/css/global`. Utiliza los estilos existentes en lugar de crear nuevos. Los estilos específicos de componentes están en `/templates/css/objects`.

============================
## Commits convencionales
- 🔧 feat: Añade una nueva funcionalidad.
- 🐛 fix: Corrige errores en el código.
- 📚 docs: Cambios en la documentación.
- 🎨 style: Cambios en el estilo del código (sin alterar la funcionalidad).
- 🔄 refactor: Mejora el código sin cambiar la funcionalidad.
- ⚡ perf: Mejora el rendimiento.
- 🧪 test: Añade o ajusta pruebas.
- 🔧 build: Cambios en el sistema de construcción.
- 🔗 ci: Configuración de integración continua.
- 🛠️ chore: Tareas de mantenimiento y otros cambios menores.
- 🖼️ img: Agregar imágenes.