# Red Segura VES — Puesta en marcha y moderación
**La web ya está integrada. NO necesitas copiar y pegar archivos, ni añadir enlaces al menú.**

## Instalación rápida
1. Descomprime el ZIP.
2. Abre la carpeta en VS Code y ejecuta `index.html` con Live Server.
3. Recorre las siete páginas; ya está conectado el menú Comunidad.
4. En `comunidad.html?demo=1` tendrás datos de demostración explícitamente ficticios.

## Activar la base de datos compartida
1. Crea un proyecto en https://supabase.com.
2. Ejecuta `supabase_esquema.sql` completo en SQL Editor.
3. Cambia `url` y `publishableKey` dentro de `comunidad-config.js` por los de tu proyecto.
4. Reabre `comunidad.html` y `ayuda.html` con Live Server.
5. **Usa solo una clave pública `sb_publishable_...`**; nunca pegues contraseñas ni claves secretas en GitHub.

El código en esta entrega ofrece un prototipo de integración. **No se debe publicar para usuarios reales antes de instalar controles efectivos contra bots y envíos masivos, cerrar los permisos, y contar con moderación operativa**.

## 7. Probar una contribución real

1. Ve a `ayuda.html`.
2. Responde el cuestionario SIN elegir «peligro inmediato».
3. Después de los resultados, marca la casilla de consentimiento.
4. Pulsa **Contabilizar mi consulta**.
5. En Supabase > Table Editor > `rsv_conteos_internos` verifica que aumentó el
   total del mes actual para esa categoría.

**No lo verás inmediatamente en la web pública.** Para evitar filtraciones
por cambios de conteo en tiempo real, los datos se publican por mes cerrado
y después de superar un umbral mínimo.

## 8. Cómo publicar un mes de estadísticas REALES

El administrador abre SQL Editor, revisa las contribuciones y ejecuta,
usando como fecha el primer día de un MES YA FINALIZADO:

```sql
select public.rsv_publicar_mes(date '2026-10-01');
```

La función devuelve `true` si publicó y `false` si no había suficientes
aportaciones o existían categorías con recuentos de 1 a 4. Se necesitan al
menos **20 aportaciones en ese mes**, y ninguna categoría de baja frecuencia
se publica. Los meses aún abiertos están bloqueados.

Si gana el hackathon y lanzan antes de tener suficientes aportaciones,
**la web debe mostrar «sin datos suficientes»**, no cifras inventadas.

## 9. Moderar opiniones en Supabase

Las personas podrán enviar comentarios sobre la WEB. Son privados hasta que
el equipo revise el contenido. Solo el administrador puede ver el texto original.

Ver opiniones pendientes:

```sql
select id, calificacion, comentario_original, creado_en
from public.rsv_opiniones
where estado = 'pendiente'
order by creado_en;
```

Para aprobar una opinión, copia SOLO el texto seguro a `comentario_publicado`
y cambia el ID por el real:

```sql
update public.rsv_opiniones
set comentario_publicado = 'La información se entiende y los botones son fáciles de encontrar.',
    estado = 'aprobada',
    aprobado_en = now()
where id = 123;
```

Para rechazar:

```sql
update public.rsv_opiniones set estado = 'rechazada' where id = 123;
```

No apruebes comentarios que incluyan nombres, detalles de violencia,
identificación de terceros, amenazas o información que pueda revelar
indirectamente a una persona. El SQL utiliza filtros básicos de teléfono,
email y enlaces, pero no detecta todos los datos identificables.
Es obligatorio revisar cada mensaje.

## 10. Checklist antes de lanzar a PERSONAS REALES

[ ] Probar funciones en la URL desplegada por HTTPS.
[ ] Comprobar que los permisos `anon` NO permiten leer las tablas directamente.
[ ] Implementar límites de peticiones EFECTIVOS en el servidor o gateway
    (la protección por sesión de navegador puede evadirse).
[ ] Incorporar defensa anti-bots / CAPTCHA con evaluación de privacidad,
    y un procedimiento para moderar y retirar opiniones.
[ ] Revisar protección de datos y avisos legales aplicables en Perú.
[ ] Definir responsables y calendario para publicación mensual y borrado
    periódico de opiniones rechazadas o pendientes.
[ ] Confirmar que fotos y recursos externos no expongan datos innecesarios.
[ ] Validar nuevamente los contactos oficiales del directorio.
[ ] Realizar pruebas de accesibilidad, móviles y seguridad.
[ ] No confundir «orientaciones consultadas» con denuncias ni personas atendidas.
[ ] Usar cuentas administrativas con autenticación multifactor y copias de seguridad.

**IMPORTANTE:** Esta entrega es una integración de demostración funcional.
NO se debe lanzar públicamente con escritura anónima abierta sin protección
real contra abuso, moderación operativa y revisión de privacidad. Supabase
procesará peticiones de navegador con datos técnicos como la IP, aunque
la tabla de estadísticas no guarde identidades.

Documentación oficial:
- Supabase REST API: https://supabase.com/docs/guides/api/creating-routes
- Claves API: https://supabase.com/docs/guides/getting-started/api-keys
- Funciones y permisos: https://supabase.com/docs/guides/database/functions
- Seguridad de API: https://supabase.com/docs/guides/api/securing-your-api
