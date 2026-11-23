/* Comunidad pública: muestra SOLO resúmenes publicados y opiniones aprobadas. */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "comunidad") return;

  const $ = id => document.getElementById(id);
  const demo = new URLSearchParams(location.search).get("demo") === "1";
  const API = window.RSV_COMUNIDAD;
  const categorias = [
    { id: "psicologica", nombre: "Apoyo psicológico" },
    { id: "legal", nombre: "Orientación legal" },
    { id: "proteccion", nombre: "Protección y auxilio" }
  ];

  function el(tag, clase, contenido) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (contenido !== undefined) nodo.textContent = String(contenido);
    return nodo;
  }
  function nombreMes(fecha) {
    return new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(fecha + "T12:00:00Z"));
  }
  function noDatos(nodo, mensaje) {
    nodo.replaceChildren(el("p", "rsv-no-data", mensaje));
  }

  function mostrarResumen(filas) {
    const mapa = new Map((Array.isArray(filas) ? filas : []).map(x => [x.categoria, Number(x.cantidad) || 0]));
    const total = categorias.reduce((s, c) => s + (mapa.get(c.id) || 0), 0);
    $("rsv-total").replaceChildren(document.createTextNode(total.toLocaleString("es-PE")),
      el("small", "", total === 1 ? "consulta voluntaria publicada" : "consultas voluntarias publicadas"));
    $("rsv-aviso").textContent = "";
    if (total === 0) {
      noDatos($("rsv-barras"), "Aún no hay datos mensuales aprobados para publicación. Los porcentajes aparecerán cuando existan suficientes aportaciones.");
      return;
    }
    $("rsv-barras").replaceChildren();
    for (const cat of categorias) {
      const cant = mapa.get(cat.id) || 0;
      const porc = Math.round(cant / total * 1000) / 10;
      const row = el("div", "rsv-line");
      const title = el("div", "rsv-line-title");
      title.append(el("span", "", cat.nombre), el("span", "rsv-line-value", porc.toLocaleString("es-PE") + " %"));
      const rail = el("div", "rsv-line-track");
      rail.setAttribute("role", "progressbar");
      rail.setAttribute("aria-label", cat.nombre);
      rail.setAttribute("aria-valuemin", "0");
      rail.setAttribute("aria-valuemax", "100");
      rail.setAttribute("aria-valuenow", String(porc));
      const fill = el("div", "rsv-line-fill");
      fill.style.width = porc + "%";
      rail.append(fill);
      row.append(title, rail);
      $("rsv-barras").append(row);
    }
  }

  function mostrarHistorial(filas) {
    const lista = $("rsv-historial");
    lista.replaceChildren();
    if (!Array.isArray(filas) || filas.length === 0) {
      noDatos(lista, "Todavía no hay meses cerrados con suficientes aportaciones para publicar.");
      return;
    }
    for (const fila of filas) {
      const mes = el("article", "rsv-month");
      const cab = el("div", "rsv-month-head");
      cab.append(el("h3", "", nombreMes(String(fila.periodo))), el("span", "rsv-month-total", `${Number(fila.total)||0} consultas`));
      const p = el("p", "", `Psicológica: ${Number(fila.psicologica)||0} · Legal: ${Number(fila.legal)||0} · Protección: ${Number(fila.proteccion)||0}`);
      mes.append(cab, p);
      lista.append(mes);
    }
  }

  function mostrarOpiniones(filas) {
    const cont = $("rsv-opiniones");
    cont.replaceChildren();
    if (!Array.isArray(filas) || filas.length === 0) {
      noDatos(cont, "Todavía no hay opiniones aprobadas. Puedes enviar una sugerencia, que será revisada antes de publicarse.");
      return;
    }
    for (const item of filas) {
      const card = el("article", "rsv-review");
      const head = el("div", "rsv-review-header");
      const rating = Math.min(5, Math.max(1, Number(item.calificacion) || 1));
      head.append(el("strong", "", "Opinión anónima revisada"), el("span", "rsv-stars", "★".repeat(rating) + "☆".repeat(5-rating)));
      card.append(head, el("p", "", item.comentario || ""));
      cont.append(card);
    }
  }

  // Datos simulados: nunca se confunden con cifras reales ni se guardan.
  const muestra = {
    resumen: [
      { categoria: "psicologica", cantidad: 48 },
      { categoria: "legal", cantidad: 29 },
      { categoria: "proteccion", cantidad: 23 }
    ],
    historial: [
      { periodo: "2026-10-01", psicologica: 27, legal: 14, proteccion: 11, total: 52 },
      { periodo: "2026-09-01", psicologica: 21, legal: 15, proteccion: 12, total: 48 }
    ],
    opiniones: [
      { calificacion: 5, comentario: "Me resultó fácil encontrar la sección de orientación psicológica y entender los pasos." },
      { calificacion: 4, comentario: "Me gustaría que el directorio permita consultar las instituciones también por nombre." }
    ]
  };

  async function iniciar() {
    if (demo) {
      $("rsv-demo").hidden = false;
      mostrarResumen(muestra.resumen);
      mostrarHistorial(muestra.historial);
      mostrarOpiniones(muestra.opiniones);
      $("rsv-envio-estado").textContent = "Modo demostración: no se enviarán opiniones.";
      $("rsv-enviar").disabled = true;
      return;
    }
    if (!API?.listo) {
      $("rsv-aviso").textContent = "Aún no está conectada la base de datos. Para explorar la interfaz con cifras ficticias, abre comunidad.html?demo=1. No representan consultas reales.";
      $("rsv-barras").replaceChildren();
      noDatos($("rsv-historial"), "Configura Supabase para mostrar el historial público.");
      noDatos($("rsv-opiniones"), "Configura Supabase para mostrar opiniones aprobadas.");
      $("rsv-enviar").disabled = true;
      return;
    }

    const resultados = await Promise.allSettled([
      API.rpc("rsv_resumen_por_tipo"),
      API.rpc("rsv_historial_mensual"),
      API.rpc("rsv_opiniones_aprobadas")
    ]);
    if (resultados[0].status === "fulfilled") mostrarResumen(resultados[0].value);
    else $("rsv-aviso").textContent = "No se pudo cargar el resumen. Comprueba la conexión o inténtalo más tarde.";
    if (resultados[1].status === "fulfilled") mostrarHistorial(resultados[1].value);
    else noDatos($("rsv-historial"), "No se pudo cargar el historial.");
    if (resultados[2].status === "fulfilled") mostrarOpiniones(resultados[2].value);
    else noDatos($("rsv-opiniones"), "No se pudieron cargar las opiniones.");
  }

  $("rsv-form-opinion").addEventListener("submit", async event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || demo || !API?.listo) return;
    const opinion = $("rsv-comentario").value.trim();
    const calificacion = Number($("rsv-calificacion").value);
    const estado = $("rsv-envio-estado");
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) return;
    if (opinion.length < 20 || opinion.length > 400) {
      estado.textContent = "Escribe entre 20 y 400 caracteres.";
      return;
    }
    if (/(https?:\/\/|www\.|@|(?:[0-9][\s().-]*){7,})/i.test(opinion)) {
      estado.textContent = "No incluyas números de teléfono, correos ni enlaces.";
      return;
    }
    if (!$("rsv-consentimiento").checked) {
      estado.textContent = "Debes aceptar la revisión y posible publicación.";
      return;
    }
    const boton = $("rsv-enviar");
    boton.disabled = true;
    estado.textContent = "Enviando opinión...";
    try {
      await API.rpc("rsv_enviar_opinion", {
        p_calificacion: calificacion,
        p_comentario: opinion
      });
      $("rsv-form-opinion").reset();
      estado.textContent = "Opinión recibida para revisión. No se publicará automáticamente.";
    } catch (_) {
      estado.textContent = "No se pudo enviar la opinión. Comprueba tu conexión e inténtalo más tarde.";
    } finally {
      boton.disabled = false;
    }
  });
  iniciar();
});
