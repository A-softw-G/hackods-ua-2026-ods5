# Red Segura VES

**Orientación accesible y discreta frente a situaciones de violencia en Villa El Salvador, Lima, Perú.**

**HackODS UA 2026 · ODS 5: Igualdad de Género · Universidad Autónoma del Perú**

> **Aviso importante:** Red Segura VES es un proyecto académico de orientación. **No es una entidad oficial, no recibe denuncias ni ofrece intervención de emergencia.** Si una persona está en peligro inmediato en Perú, puede contactar a la **Policía Nacional (105)**. Para orientación frente a la violencia, está disponible la **Línea 100**. La disponibilidad y los datos locales deben confirmarse con las instituciones correspondientes.

## 1. ¿Qué es Red Segura VES?

Red Segura VES es una aplicación web que ayuda a las personas a **identificar servicios de orientación psicológica, legal y de protección**. Está pensada para facilitar el acceso a información en Villa El Salvador sin exigir nombres, DNI, direcciones particulares ni geolocalización.

El proyecto aborda las barreras que pueden dificultar la búsqueda de apoyo: desconocimiento de los servicios, temor a compartir datos, poca claridad sobre qué institución contactar y necesidad de orientación sencilla desde un celular.

Se desarrolla en el marco de **HackODS UA 2026**, vinculado al **Objetivo de Desarrollo Sostenible 5 (Igualdad de Género)**.

### Objetivo general

Facilitar el acceso a información confiable sobre servicios de orientación ante la violencia mediante una web gratuita, comprensible, accesible y respetuosa de la privacidad.

### Objetivos específicos

- Guiar hacia recursos adecuados mediante un cuestionario de **tres preguntas**.
- Mostrar contactos de emergencia **sin exigir completar formularios**.
- Consultar instituciones distritales y líneas nacionales con fuentes identificadas.
- Permitir guardar y recuperar recomendaciones **opcionalmente en el mismo navegador**.
- Mostrar **estadísticas públicas agregadas** de consultas de orientación, cuando existan aportaciones voluntarias suficientes y hayan sido aprobadas para publicación.
- Recibir **opiniones voluntarias sobre la plataforma**, sujetas a moderación antes de ser visibles.

## 2. Funcionalidades

| Función | Descripción | Estado |
|---|---|---|
| Inicio y navegación | Acceso directo a páginas independientes, sin depender de desplazamientos largos. | Implementada |
| Buscar ayuda | Evaluación guiada en tres pasos: riesgo, necesidad y sector general. | Implementada |
| Emergencias | Enlaces telefónicos **105** y **100**, sin registro. | Implementada |
| Directorio | Instituciones filtrables por tipo de ayuda, con datos y fuentes identificadas. | Implementada; algunos datos requieren validación |
| Consultar código | Guarda, consulta y elimina recomendaciones en `localStorage`, de forma opcional. | Implementada |
| Salida rápida | Botón visible y atajo `Alt + X` que reemplazan la página por un sitio neutral. | Implementada |
| Fotografías y carruseles | Fotografías referenciales reales, controles manuales y diseño adaptable. | Implementada; imágenes alojadas externamente |
| Comunidad | Porcentajes, historial mensual **agregado** y opiniones aprobadas. | Interfaz integrada; requiere configurar Supabase |
| Aporte estadístico | Participación voluntaria tras la evaluación; envía únicamente la categoría seleccionada. | Integrada; requiere Supabase y controles antiabuso |
| Opiniones | Valoración de la web y comentario sujeto a revisión humana. | Integrada; requiere Supabase y moderación operativa |

**Importante:** el historial público **no muestra solicitudes individuales, expedientes ni testimonios de víctimas**. Las estadísticas reflejan aportaciones voluntarias sobre categorías consultadas; **no equivalen a denuncias, personas atendidas ni incidencia real de violencia**.

## 3. Tecnologías

**Interfaz y lógica principal**
- HTML5
- CSS3
- JavaScript puro (sin frameworks)
- `localStorage` para recomendaciones guardadas voluntariamente

**Módulo de comunidad**
- PostgreSQL
- Supabase (alojamiento de PostgreSQL y API mediante funciones SQL)
- Funciones SQL y políticas de acceso para separar información interna de datos públicos

No es necesario instalar dependencias para **abrir y recorrer la web base**. Para compartir estadísticas y opiniones entre visitantes se necesita **configurar un proyecto de Supabase** y disponer de Internet.

### Arquitectura general

```text
Visitante (navegador)
         |
         +--> HTML + CSS + JavaScript
         |       |
         |       +--> Cuestionario y directorio (datos.ves.js)
         |       |
         |       +--> Recomendaciones opcionales en localStorage
         |       |
         |       +--> Contactos oficiales y salida rápida
         |
         +--> Comunidad (solo si se configura Supabase)
                 |
                 +--> API HTTPS / funciones SQL autorizadas
                         |
                         +--> PostgreSQL
                               |-- Conteos internos agregados
                               |-- Resúmenes mensuales publicados
                               |-- Opiniones pendientes o moderadas
```

No debe colocarse una contraseña de PostgreSQL ni una clave secreta de Supabase en JavaScript del navegador.

## 4. Estructura del repositorio

```text
Red_Segura_VES/
├── index.html                 # Inicio y carrusel principal
├── ayuda.html                 # Evaluación y resultados
├── emergencia.html            # Contactos inmediatos
├── instituciones.html         # Directorio filtrable
├── consultar.html             # Códigos guardados en el navegador
├── comunidad.html             # Estadísticas y opiniones
├── sobre.html                 # Proyecto y privacidad
├── styles.css                 # Estilos generales
├── comunidad.css              # Estilos del módulo Comunidad
├── app.js                     # Cuestionario, directorio, códigos y navegación
├── datos.ves.js               # Directorio de instituciones y fuentes
├── comunidad-config.js        # URL y clave pública de Supabase
├── comunidad-api.js           # Solicitudes autorizadas a la API
├── comunidad.js               # Estadísticas e interfaz de opiniones
├── comunidad-optin.js         # Consentimiento para aportar estadísticas
├── supabase_esquema.sql       # Tablas, funciones y permisos PostgreSQL
├── CONFIGURAR_Y_MODERAR.md    # Configuración, publicación y moderación
├── FOTOS_Y_LICENCIAS.md      # Procedencia de fotografías
└── README.md                  # Este documento
```

> Si subes los archivos a la **raíz del repositorio** en lugar de conservar una carpeta `Red_Segura_VES/`, los enlaces relativos también pueden funcionar, siempre que los archivos permanezcan juntos.

## 5. Ejecutar el proyecto localmente

1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/A-softw-G/hackods-ua-2026-ods5.git
   ```
2. Abre en **Visual Studio Code** la carpeta que contiene `index.html`.
3. Instala la extensión **Live Server** si aún no la tienes.
4. Abre `index.html`, haz clic derecho y selecciona **Open with Live Server**.
5. Navega por las siete páginas mediante el menú.

El sitio normalmente se abrirá en una dirección similar a:

```text
http://127.0.0.1:5500/index.html
```

El puerto puede variar. Las funcionalidades locales (cuestionario, directorio y códigos) pueden probarse sin configurar PostgreSQL. Las fotografías alojadas externamente requieren conexión a Internet.

### Modo demostración de Comunidad

Para previsualizar estadísticas y comentarios **ficticios claramente etiquetados**, abre:

```text
http://127.0.0.1:5500/comunidad.html?demo=1
```

Este modo **no registra comentarios ni aportaciones reales**. No debe confundirse con estadísticas de usuarios.

## 6. Configurar PostgreSQL + Supabase

El módulo de Comunidad necesita una base de datos compartida. **No basta con subir el HTML a GitHub** para activar esa conexión.

1. Crea un proyecto propio en [Supabase](https://supabase.com/).
2. En el panel del proyecto, abre **SQL Editor**.
3. Copia el contenido de `supabase_esquema.sql` y ejecútalo **en tu proyecto de prueba**, después de revisarlo.
4. Localiza la **Project URL** y la **publishable key** del proyecto.
5. Abre `comunidad-config.js` y reemplaza los valores de ejemplo:

   ```javascript
   window.RSV_COMUNIDAD_CONFIG = {
     url: "https://TU_PROYECTO.supabase.co",
     publishableKey: "sb_publishable_REEMPLAZAR_AQUI"
   };
   ```

6. Abre `comunidad.html` **sin** `?demo=1`.
7. Prueba los formularios en un entorno controlado y revisa los registros desde Supabase.

**Seguridad de claves:** una clave *publishable* está pensada para el cliente, pero **nunca** publiques `sb_secret_...`, `service_role`, contraseñas de PostgreSQL ni otras credenciales administrativas. Las operaciones deben estar restringidas con permisos efectivos. El esquema incluido crea funciones específicas y restringe el acceso directo a tablas; **esto no sustituye medidas antiabuso**.

### Tablas principales

| Tabla | Finalidad | Acceso desde la web |
|---|---|---|
| `rsv_conteos_internos` | Conteos mensuales por categoría aportados voluntariamente. | Sin lectura directa |
| `rsv_resumen_publicado` | Resúmenes mensuales autorizados para publicación. | Solo mediante funciones de lectura |
| `rsv_opiniones` | Calificaciones, textos originales y estados de moderación. | Sin lectura directa de comentarios pendientes |

La web consume funciones SQL específicas para consultar **solo datos agregados y opiniones aprobadas**.

### Cómo se publican los porcentajes

- La persona debe aceptar **de forma voluntaria** que se contabilice la categoría de orientación consultada.
- No se envían automáticamente el riesgo, sector, código local o respuestas completas.
- Los conteos no se publican en tiempo real.
- El esquema permite publicar un **mes ya cerrado**, con al menos **20 aportaciones** y sin categorías con cantidades de **1 a 4**.
- Un administrador debe revisar los datos y ejecutar, desde **SQL Editor**, una consulta como esta, cambiando la fecha por el mes cerrado correspondiente:

```sql
select public.rsv_publicar_mes(date '2026-10-01');
```

La publicación devuelve `false` si el mes no cumple los umbrales. Si faltan aportaciones suficientes, la página debe indicar **que aún no hay datos publicables**, sin inventar cifras.

### Cómo funciona la moderación

1. Una persona envía una valoración y un comentario **sobre la experiencia de uso del sitio**.
2. El comentario queda **pendiente**, no visible públicamente.
3. El equipo revisa desde el entorno administrador y aprueba solo texto que no exponga datos personales, relatos íntimos, acusaciones identificables ni detalles de situaciones de violencia.
4. Solo el texto revisado y aprobado aparece en la página pública.

Para consultas y comandos administrativos, instrucciones precisas y controles adicionales, consulta **[`CONFIGURAR_Y_MODERAR.md`](CONFIGURAR_Y_MODERAR.md)**.

## 7. Privacidad, seguridad y límites

Red Segura VES está dirigido a un contexto sensible. El diseño de privacidad es una **condición para el lanzamiento**, no solo una característica visual.

- No solicita **nombre, DNI, domicilio ni ubicación GPS** para orientar.
- El cuestionario no guarda ni envía automáticamente las respuestas.
- Los códigos se guardan **solo si la persona lo acepta** y se recuperan únicamente desde el navegador que conserva esos datos.
- `localStorage` no equivale a almacenamiento cifrado ni garantiza confidencialidad en equipos compartidos.
- La salida rápida reemplaza la página, **pero no borra historial, pestañas recientes ni otros rastros**.
- Los enlaces externos (mapas, fuentes oficiales) y las fotografías remotas pueden compartir datos técnicos, como la dirección IP, con sus proveedores.
- Supabase puede recibir datos técnicos de conexión al enviar una opinión o aportación estadística.
- **No se publica un historial de personas ni una lista de solicitudes individuales de ayuda.**
- La plataforma **no registra denuncias** ni confirma horarios o disponibilidad en tiempo real.

### Obligatorio antes del lanzamiento público

- [ ] Verificar nuevamente con fuentes oficiales los teléfonos, horarios y direcciones del directorio.
- [ ] Alojar localmente las fotografías autorizadas para evitar solicitudes innecesarias a terceros.
- [ ] Usar **HTTPS** y revisar la configuración del despliegue.
- [ ] Implementar controles efectivos de **rate limiting**, protección anti-bots y moderación.
- [ ] Comprobar que los usuarios anónimos **no pueden leer tablas internas ni ejecutar funciones administrativas**.
- [ ] Revisar tratamiento de datos personales y avisos aplicables en Perú.
- [ ] Establecer un responsable de moderación, retirada de contenido y conservación limitada.
- [ ] Activar autenticación multifactor para administradores y realizar copias de seguridad.
- [ ] Hacer pruebas de accesibilidad, teclado, lectores de pantalla, celulares y seguridad.
- [ ] Validar flujos en el dominio definitivo y planificar mantenimiento del directorio.

**La integración disponible es un prototipo técnico; no debe activarse para visitantes reales sin completar estas medidas.**

## 8. Pruebas del proyecto

Se reportaron satisfactorias las siguientes **12 pruebas manuales** sobre el flujo del sitio:

- [x] Cuestionario de tres preguntas.
- [x] Resultados para apoyo psicológico.
- [x] Resultados para orientación legal.
- [x] Contactos inmediatos ante riesgo.
- [x] Generación, consulta y recuperación de un código local.
- [x] Eliminación de datos guardados.
- [x] Navegación entre páginas.
- [x] Controles de carruseles.
- [x] Botón de salida rápida.
- [x] Enlaces telefónicos desde celular.
- [x] Visualización en pantalla pequeña.
- [x] Navegación y lectura comprensibles durante el recorrido.

Estas pruebas **no certifican** la seguridad ni la disponibilidad de los servicios externos.

**Pendientes específicos del nuevo módulo:**
- [ ] Comprobar la conexión con un proyecto Supabase real.
- [ ] Probar restricciones de lectura y escritura con un cliente anónimo.
- [ ] Validar moderación, publicación mensual y límites de aportaciones.
- [ ] Realizar pruebas de abuso, accesibilidad y despliegue HTTPS.

## 9. Directorio institucional y fuentes

`datos.ves.js` contiene un directorio inicial con **ocho recursos** distritales o nacionales, incluyendo:

- Policía Nacional del Perú: **105**.
- MIMP / Línea 100: **100**.
- MINSA / Línea 113, opción 5.
- Centro Emergencia Mujer de Villa El Salvador (**contactos locales por confirmar**).
- Centros de Salud Mental Comunitaria registrados para Villa El Salvador.

Cada ficha puede incluir categoría, descripción, teléfono, dirección, horario, procedencia y fecha de revisión. **Los campos que no hayan podido confirmarse deben mostrarse como “Por confirmar”.** Una ficha no garantiza atención presencial inmediata.

Fuentes de referencia incluidas en el proyecto:
- [Ministerio de la Mujer y Poblaciones Vulnerables — Línea 100](https://www.gob.pe/479)
- [Policía Nacional del Perú — Contactos y números de emergencia](https://www.gob.pe/institucion/pnp/contacto-y-numeros-de-emergencias)
- [Ministerio de Salud — Centros de salud](https://www.gob.pe/10942-conocer-centros-de-salud)

Antes de utilizar la web públicamente, el equipo debe revisar cada fuente y actualizar `datos.ves.js` cuando corresponda.

## 10. Despliegue y actualizaciones

El sitio estático puede publicarse en un servicio compatible con HTML, CSS y JavaScript, incluido GitHub Pages. La publicación de archivos **no implementa automáticamente PostgreSQL**: Supabase opera como servicio independiente.

Si trabajas desde una copia local del repositorio:

```bash
git add .
git commit -m "Actualizar Red Segura VES y documentar módulo Comunidad"
git push
```

Para sustituir **solo este README** desde GitHub: abre `README.md` en el repositorio, selecciona **Editar**, reemplaza su contenido y confirma el cambio (*Commit changes*).

No incluyas credenciales secretas ni datos de personas en los commits.

## 11. Equipo

**Universidad Autónoma del Perú · Ingeniería de Software · IV ciclo**

| Integrante | Responsabilidad |
|---|---|
| **Sebastián Mio Villarreal** | Lógica de orientación y directorio institucional |
| **Andy Guerra Mejia** | Interfaz web e integración |
| **Joseph Abril Gonzales** | Documentación, pruebas y presentación |

**Docente:** Jhonny Alex Zarate Bocanegra  
**Concurso:** HackODS UA 2026  
**Repositorio:** [A-softw-G/hackods-ua-2026-ods5](https://github.com/A-softw-G/hackods-ua-2026-ods5)

## 12. Próximos pasos

1. Conectar y verificar Supabase en un entorno de pruebas.
2. Fortalecer los controles de seguridad y privacidad del módulo Comunidad.
3. Completar la comprobación de datos institucionales locales.
4. Realizar pruebas de accesibilidad, seguridad y funcionamiento en el dominio desplegado.
5. Preparar una demostración del recorrido completo, distinguiendo **datos reales** de **datos de ejemplo**.

---

**Red Segura VES — HackODS UA 2026 · ODS 5: Igualdad de Género.**  
*La finalidad de este proyecto es orientar hacia servicios existentes de ayuda; no sustituye a las autoridades ni a los profesionales responsables de la atención.*
