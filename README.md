# Red Segura VES — Web completa + Comunidad (PostgreSQL)
**HackODS UA 2026 · ODS 5 · Universidad Autónoma del Perú**

Equipo: **Sebastián Mio Villarreal**, **Andy Guerra Mejia** y **Joseph Abril Gonzales** — Ingeniería de Software, IV ciclo.
Docente: **Jhonny Alex Zarate Bocanegra**.
Repositorio: https://github.com/A-softw-G/hackods-ua-2026-ods5.git

## Iniciar la web (sin instalar nada)
1. **Descomprime el archivo ZIP completo** en una carpeta.
2. Abre **esa carpeta** en Visual Studio Code.
3. En `index.html`, haz clic derecho → **Open with Live Server**. También puedes abrir el HTML directamente, pero Live Server es preferible para probar la persistencia entre páginas.
4. Navega por los menús. La nueva página `comunidad.html` se ha integrado en todas las páginas.
5. Para **ver un ejemplo de las nuevas estadísticas sin base de datos**, entra en:
   `http://127.0.0.1:5500/comunidad.html?demo=1`
   (el puerto puede cambiar). **Todos los datos de ese modo son ficticios y están etiquetados.**

**IMPORTANTE**: el sitio original funciona localmente, pero **para compartir estadísticas reales y opiniones entre visitantes tienes que configurar PostgreSQL/Supabase**. No se puede incluir una base de datos en línea con credenciales inventadas. La sección Comunidad, fuera del modo demo, se mantendrá sin cifras hasta completar la conexión y publicar datos.

## Configurar PostgreSQL / Supabase
1. Crea tu propio proyecto en https://supabase.com y habilita la base PostgreSQL.
2. En **SQL Editor**, abre el archivo `supabase_esquema.sql` incluido en esta carpeta y ejecútalo.
3. Ve a la sección de configuración/las claves API del proyecto, copia tu **URL** y la clave **publishable** (pública).
4. Abre `comunidad-config.js` y reemplaza `https://TU_PROYECTO.supabase.co` y `sb_publishable_REEMPLAZAR_AQUI`.
5. **Jamás** añadas al HTML/JavaScript una `service_role`, clave `sb_secret_...` o contraseña de PostgreSQL.
6. Abre `comunidad.html` sin `?demo=1`: las cifras mostrarán "sin datos" hasta que haya contribuciones agregadas de meses cerrados y se autorice su publicación.
7. Para publicar meses y aprobar opiniones, utiliza únicamente el SQL Editor administrador, siguiendo `CONFIGURAR_Y_MODERAR.md`.

## Estructura integrada
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página inicial y enlaces a las siete secciones |
| `ayuda.html` | Cuestionario y recomendaciones; ofrece contribuir **voluntariamente** a estadísticas |
| `emergencia.html` | Contactos 105 y Línea 100, sin registro ni encuesta |
| `instituciones.html` | Directorio oficial, enlaces y filtros |
| `consultar.html` | Códigos privados del **mismo navegador**, con eliminación |
| `sobre.html` | Sobre el proyecto y limitaciones de privacidad |
| `comunidad.html` | Porcentajes y recuentos por mes, opiniones **aprobadas** |
| `styles.css`, `comunidad.css` | Diseño de las páginas |
| `app.js`, `datos.ves.js` | Cuestionario, directorio y guardado local |
| `comunidad-config.js`, `comunidad-api.js`, `comunidad.js`, `comunidad-optin.js` | Configuración, conexión con Supabase y comunidad |
| `supabase_esquema.sql` | Tablas, funciones y permisos en PostgreSQL |
| `FOTOS_Y_LICENCIAS.md` | Fuentes de fotografías reales y limitaciones |
| `CONFIGURAR_Y_MODERAR.md` | Instrucciones para moderación, publicación de estadísticas y seguridad |

## Privacidad: algo esencial en este proyecto
- No es un sistema de denuncias oficiales ni ofrece atención inmediata.
- Las respuestas del cuestionario no se envían automáticamente a la nube.
- Si el visitante **elige voluntariamente contribuir**, se envía solo la **categoría general** consultada; Supabase recibe datos técnicos como la IP de conexión.
- Las estadísticas públicas son **agrupadas, de meses cerrados y revisadas**. No representan casos comprobados, denuncias ni incidencia real de violencia.
- Los comentarios se someten a **moderación humana**: no permitir relatos personales, datos identificables, acusaciones o información íntima.
- No existe un historial público por persona. Los códigos privados originales siguen en `localStorage`.
- La salida rápida no borra necesariamente historial ni otros rastros.
- Las fotografías reales de Pexels se cargan actualmente desde servidores externos; **para el lanzamiento alojarlas localmente** (ver `FOTOS_Y_LICENCIAS.md`).

## Estado de implementación
- **Integrado en los archivos**: siete páginas enlazadas, menú Comunidad, interfaz de estadísticas, envío optativo, esquema SQL, moderación por administrador.
- **Requiere configuración real**: Supabase, conexión y publicación autorizada de resúmenes, moderación activa.
- **Pendiente antes del lanzamiento para personas reales**: limitadores antiabuso/rate limiting en servidor, revisión de privacidad y legal, gestión de spam, pruebas de seguridad, HTTPS, respaldos, verificación actual de los teléfonos institucionales y pruebas en dispositivos reales.

No es seguro publicar un formulario de opiniones con escritura anónima abierta a Internet sin controles contra abuso y un procedimiento de moderación.

Para documentación e instalación: `CONFIGURAR_Y_MODERAR.md`.
