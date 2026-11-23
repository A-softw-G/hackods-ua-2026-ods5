# Red Segura VES — (HackODS UA 2026)

## 1. ¿Qué es?
Red Segura VES es un **prototipo académico** de orientación ante la violencia en Villa El Salvador, Lima, Perú, alineado con el **ODS 5 — Igualdad de Género**. Ayuda a encontrar información institucional y teléfonos de contacto sin solicitar nombre, DNI ni ubicación precisa. **No recibe denuncias, no presta atención de emergencias ni confirma disponibilidad en tiempo real.**

## 2. ¿Qué cambió respecto a la primera versión?
- **Seis páginas separadas**. Los accesos del inicio abren otra página; ya no desplazan al visitante hasta una sección muy lejana.
- **Dos carruseles con fotografías reales**, no creadas por IA, con avance manual, indicadores y sin reproducción automática.
- Aspecto editorial: encabezados con jerarquía clara, fotografías grandes, listas separadas por líneas y menos paneles/casillas.
- Navegación visible en móviles, con botón **Salida rápida** en todas las páginas.
- Mantiene las tres preguntas, filtrado según la necesidad, directorio, códigos opcionales y borrado.

## 3. Archivos
- `index.html`: inicio, botones para acceder a las demás páginas, carrusel y explicación sencilla.
- `ayuda.html`: cuestionario en tres pasos, detección de emergencia, resultados y guardado voluntario.
- `emergencia.html`: teléfonos 105 y Línea 100 siempre disponibles, sin registro.
- `instituciones.html`: directorio con categorías y enlaces a fuentes oficiales.
- `consultar.html`: códigos locales, consulta y eliminación de registros.
- `sobre.html`: propósito académico, privacidad, segundo carrusel.
- `styles.css`: diseño adaptable y accesible.
- `app.js`: lógica de navegación visual, carruseles y funcionalidades locales.
- `datos.ves.js`: registro editable de instituciones y fuentes.
- `FOTOS_Y_LICENCIAS.md`: fotografías, enlaces y notas de privacidad.

Todos los archivos usan HTML, CSS y JavaScript sin dependencias externas. No hay servidor backend.

## 4. Cómo abrirlo
1. Descomprimir el ZIP.
2. Abrir la carpeta `red-segura-ves-v2` en Visual Studio Code.
3. Abrir `index.html` directamente **o**, preferentemente, con **Live Server** para probar el almacenamiento local entre páginas.
4. Navegar con el menú. En móvil, el menú superior se puede desplazar horizontalmente.
5. No hace falta instalar paquetes ni registrarse.

## 5. Cómo funciona
- **Inicio:** "Encontrar ayuda" lleva a `ayuda.html`; "Necesito ayuda urgente" a `emergencia.html`.
- **Emergencia:** enlaces `tel:105` y `tel:100`, sin cuestionario.
- **Evaluación:** una pregunta por paso, con validación; si se marca peligro inmediato, se presentan los teléfonos sin exigir continuar. Las respuestas no se guardan automáticamente.
- **Resultados:** la selección usa el tipo de servicio. El sector solamente ayuda a ordenar, **no** garantiza la cobertura.
- **Guardar:** si se solicita, genera un código al azar `VES-XXXXXXXXXXXX` y guarda localmente **solo** el código, la fecha y los identificadores de servicios, no las respuestas.
- **Consultar:** exige el mismo navegador y datos locales conservados. El código **no** corresponde a un reporte o denuncia oficial.
- **Eliminar:** se puede borrar el registro consultado o todos los registros.
- **Salida rápida:** botón de todas las páginas y atajo `Alt+X`; reemplaza la pestaña por un buscador. **No borra el historial, las pestañas recientes ni otros rastros.**

## 6. Fotografías reales: origen, licencia y privacidad
Las fotografías utilizadas son **fotografías de stock auténticas**, no imágenes generadas por IA. **Son ilustrativas**, no evidencias de casos atendidos por Red Segura VES y no muestran necesariamente Villa El Salvador ni sus instituciones.

Se utilizan fotografías de Pexels. El portal autoriza el uso en sitios web de acuerdo con su [licencia](https://www.pexels.com/license/); se incluyen enlaces y créditos voluntarios en `FOTOS_Y_LICENCIAS.md`.

**Importante antes de publicar:** para que las fotos aparezcan con esta entrega, cada página solicita imágenes al servidor externo `images.pexels.com`. Eso puede comunicar la IP del visitante al proveedor y significa que **las fotos no se muestran sin conexión**. No hay analítica ni rastreadores integrados; no obstante, para cumplir plenamente el objetivo de privacidad, **es recomendable descargar las fotos permitidas por su licencia, reducir su tamaño y alojarlas dentro de la carpeta del sitio**; después, cambiar cada `src="https://images.pexels.com/..."` por `src="fotos/nombre-de-archivo.jpg"`. Esta adaptación debe hacerse antes de lanzar la página para personas en situación de riesgo. El resto del sitio sigue funcionando sin red, excepto fuentes, mapas y llamadas externas.

No se cargan imágenes desde otras plataformas o APIs automáticas. No se usa ninguna imagen generada por IA.

## 7. Actualizar directorio institucional
1. Buscar **una fuente oficial actual** y comprobar teléfono, dirección y horario.
2. Abrir `datos.ves.js` y editar los campos. Datos desconocidos se dejan en `null`.
3. Modificar `fechaVerificacion` y `nombreFuente`.
4. Si se añade un servicio, asignarle un `id` único y `tipos` relevantes (`psicologica`, `legal`, `proteccion`).
5. No afirmar atención en tiempo real solo a partir de horarios publicados.

Fuentes principales:
- MIMP / Línea 100: https://www.gob.pe/479
- Policía Nacional: https://www.gob.pe/institucion/pnp/contacto-y-numeros-de-emergencias
- MINSA: https://www.gob.pe/10942-conocer-centros-de-salud

El CEM local contiene datos pendientes de confirmar. No se inventan teléfonos, horarios ni ubicaciones.

## 8. Privacidad y limitaciones
- No solicita información personal ni geolocalización.
- No transmite las respuestas a un servidor.
- Si se elige guardar, usa `localStorage` del navegador; en dispositivos compartidos puede ser visible a otras personas.
- Borrar historial o datos de sitios, usar incógnito o cambiar de navegador puede borrar las recomendaciones.
- El código local no es una contraseña ni un expediente oficial.
- Cargar fotos externas comunica datos técnicos básicos al sitio de imágenes (ver apartado 6).
- Usar HTTPS si se publica. No prometer confidencialidad absoluta.

## 9. Pruebas y validación
### Revisiones automáticas/técnicas
- [x] Seis páginas HTML generadas con enlaces relativos al sitio.
- [x] Archivo JS comprobado con `node --check` sin errores de sintaxis.
- [x] Fotografía principal y segundo carrusel cuentan con controles explícitos; no hay avance automático.
- [x] Interacciones verificadas en pruebas automatizadas de DOM: carruseles, preguntas, alerta de riesgo, filtros, generación y consulta de códigos, borrado y mensajes de error.
- [x] Revisión de los enlaces internos: no se encontraron destinos locales inexistentes.
- [x] Comprobación de desbordamiento horizontal a 360, 390, 768 y 1365 px en las páginas principales.
- [ ] Navegación multipágina y persistencia comprobadas en un navegador real contra un servidor desplegado (validación manual pendiente).
- [x] No se requieren bibliotecas de terceros.
### Validación en un navegador real (obligatoria antes del hackathon)
- [ ] Confirmar que todas las imágenes carguen por Internet y se vean correctamente en el móvil de presentación.
- [ ] Comprobar todas las pantallas con un teléfono Android y un iPhone, y la navegación por teclado.
- [ ] Completar evaluación, generar código y recuperarlo tras navegar a `consultar.html`.
- [ ] Validar llamadas telefónicas en un dispositivo compatible, sin llamar a emergencia de prueba.
- [ ] Confirmar la salida rápida y el atajo `Alt+X` en los navegadores de presentación.
- [ ] Confirmar nuevamente teléfonos, horarios y direcciones institucionales antes de enseñar datos locales.
- [ ] Descargar las fotos y alojarlas localmente si la web se va a publicar para usuarios reales.

## 10. GitHub Pages
1. Crear un repositorio nuevo en GitHub.
2. Subir **todos los archivos de la carpeta** `red-segura-ves-v2` a la raíz del repositorio.
3. En **Settings → Pages**, elegir **Deploy from a branch**, `main`, `/ (root)`, guardar.
4. Abrir la URL pública de GitHub Pages que GitHub indique.
5. Probar los seis enlaces, fotos, teléfonos, filtros y almacenamiento.
6. Para mayor privacidad, sustituir las fotos externas por copias locales **antes de publicar**.

## 11. Guion de demostración — tres minutos
1. Mostrar el inicio y señalar que los atajos abren páginas específicas.
2. Avanzar el carrusel manual y explicar la intención: fotos reales, sin mostrar violencia.
3. Abrir `ayuda.html`, responder tres preguntas y mostrar recomendaciones.
4. Generar un código local, ir a `consultar.html` y recuperarlo.
5. Abrir `emergencia.html` para mostrar 105 y Línea 100.
6. Terminar con la salida rápida y la aclaración de límites del prototipo.

## 12. Equipo
- **Sebastián Mio:** lógica y directorio.
- **Andy Guerra:** interfaz e integración.
- **Abril Gonzales:** documentación, pruebas y presentación.

## 13. Mejoras posteriores
- Alojamiento local de imágenes (para no solicitar recursos a proveedores externos).
- Revisión institucional con confirmación directa y fechas de actualización.
- Pruebas de accesibilidad con usuarios y compatibilidad móvil.
- Auditoría de privacidad antes de un despliegue para público vulnerable.
