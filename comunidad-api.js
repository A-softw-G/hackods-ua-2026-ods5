/* API de comunidad: sin frameworks ni credenciales privadas.
   Requiere comunidad-config.js antes de este archivo. */
"use strict";
(function () {
  const cfg = window.RSV_COMUNIDAD_CONFIG || {};
  const base = String(cfg.url || "").replace(/\/$/, "");
  const key = String(cfg.publishableKey || "");
  const listo = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base)
    && !base.includes("TU_PROYECTO")
    && ((key.startsWith("sb_publishable_") && !key.includes("REEMPLAZAR"))
        || key.startsWith("eyJ")); // También admite anon JWT antiguo.

  async function rpc(funcion, argumentos = {}) {
    if (!listo) throw new Error("CONFIGURACION_PENDIENTE");
    const permitidas = new Set([
      "rsv_resumen_por_tipo",
      "rsv_historial_mensual",
      "rsv_opiniones_aprobadas",
      "rsv_registrar_consulta",
      "rsv_enviar_opinion"
    ]);
    if (!permitidas.has(funcion)) throw new Error("OPERACION_NO_PERMITIDA");

    const controller = new AbortController();
    const tiempo = setTimeout(() => controller.abort(), 12000);
    try {
      const respuesta = await fetch(base + "/rest/v1/rpc/" + funcion, {
        method: "POST",
        headers: {
          "apikey": key,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(argumentos),
        signal: controller.signal,
        cache: "no-store",
        referrerPolicy: "no-referrer"
      });
      if (!respuesta.ok) throw new Error("ERROR_SERVIDOR_" + respuesta.status);
      const contenido = await respuesta.text();
      return contenido ? JSON.parse(contenido) : null;
    } finally {
      clearTimeout(tiempo);
    }
  }
  window.RSV_COMUNIDAD = { listo, rpc };
})();
