/* Red Segura VES — interacciones sin bibliotecas ni comunicaciones a servidores. */
"use strict";

(function () {
  const base = window.DATOS_VES;
  if (!base || !Array.isArray(base.instituciones)) {
    document.body.insertAdjacentText("afterbegin", "No se pudieron cargar los datos locales de instituciones.");
    return;
  }

  const $ = (id) => document.getElementById(id);
  const instituciones = base.instituciones;
  const porId = new Map(instituciones.map((item) => [item.id, item]));
  const KEY = "redSeguraVES.recomendaciones.v1";
  const LIMITE_REGISTROS = 50;
  const NOMBRES_TIPOS = {
    psicologica: "Apoyo psicológico",
    legal: "Orientación legal",
    proteccion: "Protección y auxilio"
  };

  let paso = 1;
  let resultados = [];
  let codigoConsultado = null;

  function elemento(etiqueta, clases, texto) {
    const nodo = document.createElement(etiqueta);
    if (clases) nodo.className = clases;
    if (texto !== undefined && texto !== null) nodo.textContent = String(texto);
    return nodo;
  }

  function anunciar(texto) {
    $("anuncios-accesibles").textContent = texto;
  }

  function dato(valor) {
    return valor === null || valor === undefined || String(valor).trim() === ""
      ? "Por confirmar"
      : String(valor);
  }

  function enlaceExterno(texto, url, clases) {
    const a = elemento("a", clases || "", texto);
    a.href = url;
    a.rel = "noreferrer noopener";
    a.referrerPolicy = "no-referrer";
    // No enviamos datos del usuario ni abrimos automáticamente ventanas.
    return a;
  }

  function detalle(dl, etiqueta, valor, falta) {
    const fila = elemento("div", "detail-row");
    const dt = elemento("dt", "", etiqueta);
    const dd = elemento("dd", falta ? "pending" : "", valor);
    fila.append(dt, dd);
    dl.append(fila);
  }

  function tituloZona(inst) {
    if (inst.alcance === "nacional") return "Todo el Perú";
    if (inst.sector === "sector-2") return "Villa El Salvador · Sector 2 (ubicación)";
    if (inst.sector === "sector-6") return "Villa El Salvador · Sector 6 (ubicación)";
    if (inst.sector === "sector-10") return "Villa El Salvador · Sector 10 (ubicación)";
    return "Villa El Salvador (cobertura por confirmar)";
  }

  function crearTarjeta(inst, destacar) {
    const card = elemento("article", "institution-card" + (destacar ? " is-priority" : ""));
    const meta = elemento("div", "card-meta");
    meta.append(elemento("span", "institution-badge", inst.clase));
    meta.append(elemento("span", "institution-badge scope-badge", inst.alcance === "nacional" ? "Alcance nacional" : "En Villa El Salvador"));
    card.append(meta, elemento("h3", "", inst.nombre), elemento("p", "card-desc", inst.descripcion));

    const dl = elemento("dl", "detail-list");
    detalle(dl, "Zona", tituloZona(inst), false);
    detalle(dl, "Dirección", inst.alcance === "nacional" ? "Servicio telefónico nacional" : dato(inst.direccion), inst.alcance !== "nacional" && !inst.direccion);
    detalle(dl, "Teléfono", dato(inst.numeroVisible), !inst.telefono);
    detalle(dl, "Horario", dato(inst.horario), !inst.horario);
    detalle(dl, "Atención", dato(inst.canales), !inst.canales);
    card.append(dl);

    const actions = elemento("div", "card-actions");
    if (inst.telefono && /^\d{3,14}$/.test(inst.telefono)) {
      const aLlamar = elemento("a", "button button-primary", "Llamar");
      aLlamar.href = "tel:" + inst.telefono;
      aLlamar.setAttribute("aria-label", "Llamar a " + inst.nombre + ", " + inst.numeroVisible);
      actions.append(aLlamar);
    }
    if (inst.direccion) {
      const mapa = enlaceExterno(
        "Ver ubicación ↗",
        "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(inst.direccion),
        "button button-outline"
      );
      mapa.setAttribute("aria-label", "Ver ubicación pública de " + inst.nombre + " en mapas");
      actions.append(mapa);
    }
    if (inst.fuente && /^https:\/\/(www\.gob\.pe|gob\.pe)\//.test(inst.fuente)) {
      const fuente = enlaceExterno("Fuente oficial ↗", inst.fuente, "source-link");
      fuente.setAttribute("aria-label", "Consultar fuente oficial de " + inst.nombre);
      actions.append(fuente);
    }
    card.append(actions);
    card.append(elemento("p", "verification-note", "Fuente: " + inst.nombreFuente + " · Revisada: " + inst.fechaVerificacion));

    if (!inst.horario || !inst.telefono || (inst.alcance === "distrital" && !inst.direccion)) {
      card.append(elemento("p", "missing-data-note", "Datos incompletos: confirma la información pendiente con la institución o por la Línea 100."));
    }
    if (inst.nota) card.append(elemento("p", "verification-note", inst.nota));
    return card;
  }

  function pintarTarjetas(ids, contenedor, prioritarios) {
    contenedor.replaceChildren();
    const unicos = [...new Set(ids)];
    const conocidos = unicos.map((id) => porId.get(id)).filter(Boolean);
    if (!conocidos.length) {
      contenedor.append(elemento("p", "empty-state", "No hay resultados verificados para esta combinación. Puedes comunicarte con Línea 100 para recibir orientación general."));
      return;
    }
    conocidos.forEach((inst) => contenedor.append(crearTarjeta(inst, prioritarios && prioritarios.includes(inst.id))));
  }

  function pintarDirectorio() {
    const filtro = $("filtro-tipo").value;
    const lista = instituciones.filter((inst) => filtro === "todos" || inst.tipos.includes(filtro));
    pintarTarjetas(lista.map((inst) => inst.id), $("directorio-tarjetas"), []);
  }

  function respuesta(nombre) {
    const campo = document.querySelector('input[name="' + nombre + '"]:checked');
    return campo ? campo.value : null;
  }

  function mostrarPaso(numero, moverFoco) {
    paso = numero;
    for (let i = 1; i <= 3; i++) $("paso-" + i).hidden = i !== paso;
    $("progreso-texto").textContent = "Paso " + paso + " de 3";
    $("barra-progreso").setAttribute("aria-valuenow", String(paso));
    $("progreso-relleno").style.width = (paso / 3 * 100) + "%";
    $("btn-volver").hidden = paso === 1;
    $("btn-continuar").replaceChildren(
      document.createTextNode(paso === 3 ? "Ver mis opciones de ayuda" : "Continuar "),
      elemento("span", "", "→")
    );
    $("error-evaluacion").hidden = true;
    $("alerta-inmediata").hidden = !(paso === 1 && respuesta("riesgo") === "inmediato");
    if (moverFoco) {
      const legend = $("paso-" + paso).querySelector("legend");
      legend.tabIndex = -1;
      // Mantener la pregunta visible, especialmente en celulares con el encabezado fijo.
      $("form-evaluacion").closest(".wizard-card").scrollIntoView({ block: "start", behavior: "auto" });
      legend.focus({ preventScroll: true });
    }
  }

  function seleccionarInstituciones(riesgo, ayuda, sector) {
    const candidatos = instituciones.filter((inst) => inst.tipos.includes(ayuda));

    // La zona solo prioriza cercanía orientativa; nunca excluye una institución por supuesta cobertura.
    const puntaje = (inst) => {
      let valor = 0;
      if (inst.sector && inst.sector === sector) valor += 120;
      if (inst.alcance === "distrital") valor += 25;
      if (inst.id === "cem-ves" && ayuda === "legal") valor += 200;
      if (inst.id === "minsa-113" && ayuda === "psicologica") valor += 20;
      if (inst.id === "linea-100" && ayuda === "legal") valor += 100;
      return valor;
    };
    candidatos.sort((a, b) => puntaje(b) - puntaje(a));

    const lista = candidatos.map((inst) => inst.id);

    if (riesgo === "inmediato") {
      // Salida de emergencia prioritaria con independencia de la categoría seleccionada.
      return [...new Set(["pnp-105", "linea-100", ...lista])];
    }
    if (riesgo === "reciente") return [...new Set(["linea-100", ...lista])];
    if (ayuda === "proteccion") return [...new Set(["pnp-105", "linea-100", ...lista])];
    if (ayuda === "psicologica") return [...new Set([...lista, "linea-100"])];
    if (ayuda === "legal") return [...new Set([...lista, "linea-100"])];
    return ["linea-100"];
  }

  function verResultados() {
    const riesgo = respuesta("riesgo");
    const ayuda = respuesta("ayuda");
    const sector = respuesta("sector");
    resultados = seleccionarInstituciones(riesgo, ayuda, sector);
    const urgentes = riesgo === "inmediato" || ayuda === "proteccion" || riesgo === "reciente"
      ? ["pnp-105", "linea-100"]
      : [];
    pintarTarjetas(resultados, $("resultados-tarjetas"), urgentes);
    $("resultados-resumen").textContent =
      (riesgo === "inmediato" ? "Si estás en peligro, llama primero al 105 o al 100. " : "") +
      "Estas opciones se relacionan con " + NOMBRES_TIPOS[ayuda].toLowerCase() +
      ". La zona elegida solo ordena los servicios; no asegura cobertura ni disponibilidad.";
    $("resultados").hidden = false;
    $("panel-guardar").hidden = false;
    $("guardar-mensaje").hidden = true;
    $("guardar-mensaje").replaceChildren();
    document.querySelector(".save-actions").hidden = false;
    $("resultados").scrollIntoView({ behavior: "auto", block: "start" });
    $("resultados-titulo").tabIndex = -1;
    $("resultados-titulo").focus({ preventScroll: true });
    anunciar("Opciones de ayuda disponibles. No se han guardado tus respuestas.");
  }

  function mostrarErrorEvaluacion() {
    const error = $("error-evaluacion");
    error.textContent = "Selecciona una opción para continuar. Si estás en peligro inmediato, usa los números 105 o 100.";
    error.hidden = false;
    error.scrollIntoView({ behavior: "auto", block: "nearest" });
  }

  function leerGuardados() {
    try {
      const bruto = window.localStorage.getItem(KEY);
      if (!bruto) return { ok: true, registros: [] };
      const lista = JSON.parse(bruto);
      if (!Array.isArray(lista)) return { ok: false, registros: [] };
      const validos = lista.filter((r) =>
        r && typeof r.codigo === "string" && /^VES-[A-Z2-9]{12}$/.test(r.codigo) &&
        typeof r.fecha === "string" && /^\d{4}-\d{2}-\d{2}T/.test(r.fecha) &&
        Array.isArray(r.ids) && r.ids.length >= 1 && r.ids.length <= instituciones.length &&
        r.ids.every((id) => typeof id === "string" && porId.has(id))
      );
      return { ok: true, registros: validos.slice(0, LIMITE_REGISTROS) };
    } catch (_) {
      return { ok: false, registros: [] };
    }
  }

  function escribirGuardados(registros) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(registros));
      return true;
    } catch (_) {
      return false;
    }
  }

  function borrarGuardados() {
    try {
      window.localStorage.removeItem(KEY);
      return true;
    } catch (_) {
      return false;
    }
  }

  function nuevoCodigo(existentes) {
    if (!window.crypto || typeof window.crypto.getRandomValues !== "function") return null;
    const abecedario = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let intento = 0; intento < 12; intento++) {
      // getRandomValues produce aleatoriedad criptográfica; se descartan bytes
      // fuera del mayor múltiplo de 32 para evitar sesgo de módulo.
      let parte = "";
      while (parte.length < 12) {
        const bytes = new Uint8Array(18);
        window.crypto.getRandomValues(bytes);
        for (const byte of bytes) {
          if (byte >= Math.floor(256 / abecedario.length) * abecedario.length) continue;
          parte += abecedario[byte % abecedario.length];
          if (parte.length === 12) break;
        }
      }
      const codigo = "VES-" + parte;
      if (!existentes.some((reg) => reg.codigo === codigo)) return codigo;
    }
    return null;
  }

  function actualizarContador() {
    const r = leerGuardados();
    $("total-guardados").textContent = r.ok
      ? r.registros.length + (r.registros.length === 1 ? " registro local" : " registros locales")
      : "Almacenamiento local no disponible";
  }

  function mensajeGuardar(texto) {
    const caja = $("guardar-mensaje");
    caja.replaceChildren(elemento("p", "", texto));
    caja.hidden = false;
  }

  async function copiarCodigo(codigo, destino) {
    let copiado = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codigo);
        copiado = true;
      }
    } catch (_) { /* En file:// o sin permisos puede bloquearse. */ }
    if (!copiado) {
      const auxiliar = elemento("textarea");
      auxiliar.value = codigo;
      auxiliar.setAttribute("aria-hidden", "true");
      auxiliar.style.position = "fixed";
      auxiliar.style.left = "-9999px";
      document.body.append(auxiliar);
      auxiliar.select();
      try { copiado = document.execCommand("copy"); } catch (_) { /* Copia manual disponible. */ }
      auxiliar.remove();
    }
    destino.textContent = copiado ? "Código copiado." : "Selecciona y copia el código mostrado manualmente.";
  }

  function guardarResultado() {
    const estado = leerGuardados();
    if (!estado.ok) {
      mensajeGuardar("No se puede acceder al almacenamiento local en este navegador. Puedes continuar usando la orientación sin guardar nada.");
      return;
    }
    if (estado.registros.length >= LIMITE_REGISTROS) {
      mensajeGuardar("Se alcanzó el límite de 50 registros locales. Elimina los que no necesites antes de guardar otro.");
      return;
    }
    const codigo = nuevoCodigo(estado.registros);
    if (!codigo) {
      mensajeGuardar("No hay disponible una fuente segura para generar el código en este navegador. No se guardó información.");
      return;
    }
    const registro = {
      codigo,
      fecha: new Date().toISOString(),
      ids: [...new Set(resultados)].filter((id) => porId.has(id))
    };
    if (!registro.ids.length || !escribirGuardados([...estado.registros, registro])) {
      mensajeGuardar("No se pudo guardar el registro. Es posible que el navegador bloquee el almacenamiento local.");
      return;
    }
    const caja = $("guardar-mensaje");
    caja.replaceChildren();
    caja.append(elemento("strong", "", "Recomendaciones guardadas en este navegador."));
    caja.append(elemento("p", "", "Este es tu código local; no sirve para denuncias ni trámites oficiales:"));
    const codigoVisible = elemento("code", "code-display", codigo);
    const copiar = elemento("button", "code-copy", "Copiar código");
    copiar.type = "button";
    const aviso = elemento("p", "code-feedback");
    copiar.addEventListener("click", () => copiarCodigo(codigo, aviso));
    caja.append(codigoVisible, copiar, aviso);
    caja.append(elemento("p", "", "En un dispositivo compartido, otras personas pueden encontrar esta información. Elimina el registro cuando ya no lo necesites."));
    caja.hidden = false;
    document.querySelector(".save-actions").hidden = true;
    if ($("total-guardados")) actualizarContador();
    anunciar("Código local generado. No es una denuncia ni un seguimiento oficial.");
  }

  function fechaLegible(iso) {
    const fecha = new Date(iso);
    return Number.isNaN(fecha.getTime())
      ? "Fecha desconocida"
      : fecha.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
  }

  function verGuardado(registro) {
    codigoConsultado = registro.codigo;
    $("consulta-resultados").hidden = false;
    $("consulta-fecha").textContent = "Guardado: " + fechaLegible(registro.fecha);
    const lista = $("consulta-tarjetas");
    lista.replaceChildren();
    for (const id of registro.ids) {
      const inst = porId.get(id);
      if (!inst) continue;
      const item = elemento("div", "stored-item");
      item.append(elemento("strong", "", inst.nombre));
      item.append(elemento("span", "", inst.clase + " · " + (inst.alcance === "nacional" ? "Alcance nacional" : "Villa El Salvador")));
      if (inst.telefono) {
        const llamar = elemento("a", "", "Llamar al " + inst.numeroVisible);
        llamar.href = "tel:" + inst.telefono;
        item.append(llamar);
      } else {
        item.append(enlaceExterno("Consultar fuente oficial", inst.fuente));
      }
      lista.append(item);
    }
    $("consulta-mensaje").classList.remove("is-error");
    $("consulta-mensaje").textContent = "Este código recupera una lista guardada aquí; no consulta casos, denuncias ni sistemas externos.";
  }

  function limpiarConsulta() {
    codigoConsultado = null;
    $("consulta-resultados").hidden = true;
    $("consulta-tarjetas").replaceChildren();
  }

  function consultarCodigo(codigo) {
    limpiarConsulta();
    const normalizado = codigo.trim().toUpperCase();
    const mensaje = $("consulta-mensaje");
    const estado = leerGuardados();
    mensaje.classList.remove("is-error");
    if (!/^VES-[A-Z2-9]{12}$/.test(normalizado) || !estado.ok) {
      mensaje.classList.add("is-error");
      mensaje.textContent = estado.ok
        ? "No encontramos este código en este navegador. Comprueba que sea correcto o que estés usando el mismo dispositivo."
        : "El almacenamiento local no está disponible. No se puede consultar el código en este navegador.";
      return;
    }
    const registro = estado.registros.find((r) => r.codigo === normalizado);
    if (!registro) {
      mensaje.classList.add("is-error");
      mensaje.textContent = "No encontramos este código en este navegador. Comprueba que sea correcto o que estés usando el mismo dispositivo.";
      return;
    }
    verGuardado(registro);
  }

  function salidaRapida() {
    // Se reemplaza la pestaña actual, sin confirmación ni guardado automático.
    // No borra historial ni otros rastros del navegador.
    window.location.replace("https://www.google.com/");
  }


  // Comportamiento compartido entre páginas.
  const salida = $("salida-rapida");
  if (salida) salida.addEventListener("click", salidaRapida);
  document.addEventListener("keydown", (event) => {
    if (event.altKey && !event.ctrlKey && !event.metaKey && !event.repeat &&
        event.key.toLowerCase() === "x") {
      event.preventDefault();
      salidaRapida();
    }
  });

  // Carruseles manuales: no avanzan solos ni cargan bibliotecas de terceros.
  document.querySelectorAll("[data-carousel]").forEach((carrusel) => {
    const slides = [...carrusel.querySelectorAll("[data-slide]")];
    const puntos = [...carrusel.querySelectorAll("[data-carousel-to]")];
    const indicador = carrusel.querySelector("[data-carousel-count]");
    let actual = 0;
    const mostrar = (indice) => {
      actual = (indice + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== actual;
        slide.setAttribute("aria-hidden", String(i !== actual));
      });
      puntos.forEach((punto, i) => punto.setAttribute("aria-current", String(i === actual)));
      if (indicador) indicador.textContent = String(actual + 1).padStart(2, "0") +
        " / " + String(slides.length).padStart(2, "0");
    };
    carrusel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => mostrar(actual - 1));
    carrusel.querySelector("[data-carousel-next]")?.addEventListener("click", () => mostrar(actual + 1));
    puntos.forEach((p, i) => p.addEventListener("click", () => mostrar(i)));
    carrusel.addEventListener("keydown", (event) => {
      if (!carrusel.contains(document.activeElement)) return;
      if (event.key === "ArrowRight") { event.preventDefault(); mostrar(actual + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); mostrar(actual - 1); }
    });
    slides.forEach((slide) => {
      const foto = slide.querySelector("img");
      const reemplazo = slide.querySelector(".media-fallback");
      if (foto && reemplazo) {
        foto.addEventListener("error", () => {
          foto.hidden = true;
          reemplazo.hidden = false;
        });
        if (foto.complete && foto.naturalWidth === 0) {
          foto.hidden = true;
          reemplazo.hidden = false;
        }
      }
    });
    mostrar(0);
  });

  // Evaluación (solo en ayuda.html).
  if ($("form-evaluacion")) {
    document.querySelectorAll('input[name="riesgo"]').forEach((input) => {
      input.addEventListener("change", () => {
        const alerta = $("alerta-inmediata");
        alerta.hidden = input.value !== "inmediato" || !input.checked || paso !== 1;
        $("error-evaluacion").hidden = true;
        if (!alerta.hidden) alerta.focus({ preventScroll: false });
      });
    });
    document.querySelectorAll('#form-evaluacion input[type="radio"]').forEach((input) => {
      input.addEventListener("change", () => { $("error-evaluacion").hidden = true; });
    });
    $("form-evaluacion").addEventListener("submit", (event) => {
      event.preventDefault();
      const nombre = paso === 1 ? "riesgo" : paso === 2 ? "ayuda" : "sector";
      if (!respuesta(nombre)) { mostrarErrorEvaluacion(); return; }
      if (paso < 3) { mostrarPaso(paso + 1, true); return; }
      verResultados();
    });
    $("btn-volver").addEventListener("click", () => {
      if (paso > 1) mostrarPaso(paso - 1, true);
    });
    $("reiniciar-evaluacion").addEventListener("click", () => {
      $("form-evaluacion").reset();
      resultados = [];
      $("resultados").hidden = true;
      mostrarPaso(1, true);
      anunciar("Evaluación reiniciada. No se han guardado respuestas.");
    });
    $("guardar-codigo").addEventListener("click", guardarResultado);
    $("no-guardar").addEventListener("click", () => {
      document.querySelector(".save-actions").hidden = true;
      mensajeGuardar("Continúas sin guardar. No se ha almacenado ninguna respuesta ni nueva recomendación.");
    });
    mostrarPaso(1, false);
  }

  // Directorio público (solo en instituciones.html).
  if ($("filtro-tipo")) {
    $("filtro-tipo").addEventListener("change", pintarDirectorio);
    pintarDirectorio();
  }

  // Consulta y eliminación (solo en consultar.html).
  if ($("form-consultar")) {
    $("form-consultar").addEventListener("submit", (event) => {
      event.preventDefault();
      consultarCodigo($("codigo-consulta").value);
    });
    $("eliminar-uno").addEventListener("click", () => {
      if (!codigoConsultado) return;
      const estado = leerGuardados();
      if (!estado.ok || !escribirGuardados(estado.registros.filter((r) => r.codigo !== codigoConsultado))) {
        $("consulta-mensaje").textContent = "No fue posible eliminar el registro en este navegador.";
        return;
      }
      limpiarConsulta();
      $("consulta-mensaje").classList.remove("is-error");
      $("consulta-mensaje").textContent = "Se eliminó este registro de este navegador.";
      $("codigo-consulta").value = "";
      actualizarContador();
    });
    $("eliminar-todos").addEventListener("click", () => {
      if (!borrarGuardados()) {
        $("consulta-mensaje").classList.add("is-error");
        $("consulta-mensaje").textContent = "No se pudieron eliminar los datos en este navegador.";
        return;
      }
      limpiarConsulta();
      $("codigo-consulta").value = "";
      $("consulta-mensaje").classList.remove("is-error");
      $("consulta-mensaje").textContent = "Se eliminaron todos los registros locales de Red Segura VES en este navegador.";
      actualizarContador();
    });
    actualizarContador();
  }
})();
