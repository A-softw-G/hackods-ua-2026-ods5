/* Añade una participación VOLUNTARIA al final de los resultados de ayuda.html.
   Nunca registra automáticamente las respuestas. Solo envía la categoría
   si la persona lee el aviso, marca la casilla y pulsa el botón. */
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const raiz = document.getElementById("resultados");
  if (!raiz || !document.getElementById("form-evaluacion")) return;

  const API = window.RSV_COMUNIDAD;
  const panel = document.createElement("section");
  panel.className = "rsv-optin";
  panel.setAttribute("aria-label", "Contribución voluntaria a las estadísticas");

  const titulo = document.createElement("h3");
  titulo.textContent = "¿Quieres aportar a las estadísticas públicas?";
  const intro = document.createElement("p");
  intro.textContent = "Es opcional. Se enviará únicamente la categoría de ayuda elegida, no tu nivel de riesgo, sector, código ni recomendaciones. Los resúmenes se publican después de agruparlos y revisarlos.";
  const privacidad = document.createElement("p");
  privacidad.textContent = "Al enviar, el proveedor de la base de datos puede recibir tu IP y datos técnicos de conexión.";
  const label = document.createElement("label");
  label.className = "rsv-consent";
  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  const texto = document.createElement("span");
  texto.textContent = "Acepto compartir voluntariamente únicamente el tipo de orientación consultado.";
  label.append(casilla, texto);
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "button button-outline button-small";
  boton.textContent = "Contabilizar mi consulta";
  const estado = document.createElement("p");
  estado.className = "rsv-estado";
  estado.setAttribute("role", "status");
  estado.setAttribute("aria-live", "polite");
  const link = document.createElement("a");
  link.href = "comunidad.html";
  link.textContent = "Ver estadísticas y opiniones públicas →";
  link.className = "text-link";
  panel.append(titulo, intro, privacidad, label, boton, estado, link);
  raiz.append(panel);

  // Solo memoria temporal: no dejamos un indicador adicional en el almacenamiento local.
  let enviadoEnEstaPagina = false;
  function aportoEnSesion() { return enviadoEnEstaPagina; }
  function actualiza() {
    // No pedir aportes a una persona que señaló peligro inmediato.
    const inmediato = document.querySelector('input[name="riesgo"]:checked')?.value === "inmediato";
    panel.hidden = inmediato;
    if (aportoEnSesion()) {
      boton.disabled = true;
      casilla.disabled = true;
      estado.textContent = "Ya participaste en esta página. Gracias por tu contribución.";
    }
  }
  document.querySelectorAll('input[name="riesgo"]').forEach(input =>
    input.addEventListener("change", actualiza)
  );
  new MutationObserver(actualiza).observe(raiz, { attributes: true, attributeFilter: ["hidden"] });
  actualiza();

  boton.addEventListener("click", async () => {
    const inmediato = document.querySelector('input[name="riesgo"]:checked')?.value === "inmediato";
    if (inmediato || raiz.hidden || aportoEnSesion()) return;
    if (!casilla.checked) {
      estado.textContent = "Marca la casilla si deseas contribuir voluntariamente.";
      return;
    }
    const categoria = document.querySelector('input[name="ayuda"]:checked')?.value;
    if (!["psicologica", "legal", "proteccion"].includes(categoria)) {
      estado.textContent = "Primero completa el cuestionario.";
      return;
    }
    if (!API?.listo) {
      estado.textContent = "El registro de estadísticas todavía no está configurado.";
      return;
    }
    boton.disabled = true;
    estado.textContent = "Registrando una contribución agregada...";
    try {
      await API.rpc("rsv_registrar_consulta", { p_categoria: categoria });
      enviadoEnEstaPagina = true;
      casilla.disabled = true;
      estado.textContent = "Gracias. Solo se contabilizó la categoría de orientación, no tus respuestas individuales.";
    } catch (_) {
      boton.disabled = false;
      estado.textContent = "No se pudo registrar. Puedes continuar usando la web normalmente.";
    }
  });
});
