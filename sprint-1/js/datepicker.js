/**
 * datepicker.js
 * Maneja la lógica interactiva del selector de fechas del buscador de reservas.
 * Formatea las fechas en español y previene fechas incoherentes.
 */

document.addEventListener('DOMContentLoaded', () => {
  const checkinInput = document.getElementById('Input_ida');
  const checkoutInput = document.getElementById('Input_regreso');
  const checkinVal = document.getElementById('Val_ida');
  const checkoutVal = document.getElementById('Val_regreso');
  const checkinField = document.getElementById('Field_ida');
  const checkinFieldRegreso = document.getElementById('Field_regreso');

  // ---- Helpers ----

  /**
   * Convierte una cadena de fecha ISO (YYYY-MM-DD) al formato legible en español.
   * Ej: "2026-06-14" → "Jun 14, 2026"
   * @param {string} dateString
   * @returns {string}
   */
  function formatSpanishDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    // Usar UTC para evitar desfases de zona horaria
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const day = date.getUTCDate();
    const monthStr = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${monthStr} ${day}, ${year}`;
  }

  /**
   * Convierte un objeto Date al formato ISO (YYYY-MM-DD) para el input.
   * @param {Date} d
   * @returns {string}
   */
  function formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ---- Inicialización ----

  // Establecer fechas por defecto: Hoy y Mañana
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  checkinInput.value = formatDateISO(today);
  checkoutInput.value = formatDateISO(tomorrow);

  // ---- Renderizado ----

  /** Actualiza el texto visible de las fechas en la barra de reservas. */
  const updateDisplay = () => {
    checkinVal.textContent = formatSpanishDate(checkinInput.value);
    checkoutVal.textContent = formatSpanishDate(checkoutInput.value);
  };

  updateDisplay();

  // ---- Eventos ----

  // Al cambiar la fecha de entrada, validar que salida sea posterior
  checkinInput.addEventListener('change', () => {
    updateDisplay();
    if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
      const nextDay = new Date(checkinInput.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkoutInput.value = formatDateISO(nextDay);
      updateDisplay();
    }
  });

  // Al cambiar la fecha de salida, actualizar la vista
  checkoutInput.addEventListener('change', updateDisplay);

  // Click en el bloque de fecha de entrada → abrir picker nativo
  checkinField.addEventListener('click', (e) => {
    if (e.target !== checkinInput) {
      try {
        checkinInput.showPicker();
      } catch (err) {
        checkinInput.focus();
        checkinInput.click();
      }
    }
  });

  // Click en el bloque de fecha de salida → abrir picker nativo
  checkinFieldRegreso.addEventListener('click', (e) => {
    if (e.target !== checkoutInput) {
      try {
        checkoutInput.showPicker();
      } catch (err) {
        checkoutInput.focus();
        checkoutInput.click();
      }
    }
  });
});
