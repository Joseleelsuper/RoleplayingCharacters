## Descripción del proyecto

Página web hosteada en vercel que permite a los usuarios crear y gestionar personajes de rol. Los usuarios pueden registrarse, iniciar sesión, crear personajes, editar sus atributos y habilidades, y compartirlos con otros usuarios. La aplicación está diseñada para ser intuitiva y fácil de usar, con un enfoque en la personalización de los personajes.
Se utilizan clases y razas de personajes tanto creados por juegos de rol preestablecidos como personalizados por los usuarios.

## Instrucciones de estructura y convenciones

1. Tanto nombre de variables, funciones, clases y ficheros deben estar en inglés. Documentación de funciones y clases en español.

2. Cuando te pregunte algo, respondeme en español si no rompe la regla anterior.

3. Programamos en python completamente tipado

4. Usamos fastapi con postgresql

5. Usamos el patrón repositorio para separar lógica de persistencia de nuestra lógica de negocio

6. Usamos casos de uso, encapsulamos acciones sobre dominio en clases que tienen un método execute que recibe una dataclass con los argumentos de ejecución. Estos casos de uso reciben inyectadas las dependencias como pueden ser los repositorios.

7. Usamos objetos de dominio separados de las entidades de datos de la base de datos. El mapeo entre ambas entidades ocurre en el repositorio.

8. Tenemos varias capas:
    - Dominio donde creamos las entidades
    - Aplicación donde creamos los casos de uso
    - Infrastructura donde creamos los endpoints y las implementaciones específicas de las abstracciones como pueden ser los repositorios.

9. Para las pruebas unitarias usamos pytest y pytest-asyncio. Las pruebas de integración las hacemos con pytest y httpx.

10. Para la comprobación de la estructura del código, tenemos un fichero .importLinter de la dependencia import-linter para la comprobación de la estructura del código. Este fichero contiene las reglas de importación que queremos aplicar en nuestro proyecto.

11. El mensage de los commits debe añadir el prefijo de los commits convencionales junto a su emoji y una explicación detallada pero fácil de leer para su futura revisión.

12. A la hora de necesitar añadir nuevas dependencias en el fichero requirements, no instalarlas. Suponer que ya están instaladas en el entorno.

13. En caso de necesitar añadir variables de entorno, hacerlos en el .env.example.

14. Todo import debe introducirse SIEMPRE al principio del fichero, y no a mitad del código. Esto incluye imports de librerías, módulos y paquetes, ya sea con import o empezando con from. No se permiten imports en medio del código.

15. Todo comentario explicativo no lo pongas, es decir, solo quiero comentarios sobre lo que hace una parte en concreto del código si es difícil de entender.

16. Para la traducción, utilizamos Babel y starlette-babel. Queremos hacer las traducciones mantenibles, por lo que habrá distintos ficheros para cada página.

17. Si no te lo he pedido explicitamente, NO LO HAGAS. No quiero que añadas cosas extra simplememente por la cara. Pregunta antes de programar.

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
============================