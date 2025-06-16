import { showMessage } from './ui.js';

const registroForm = document.getElementById('registro-form');
const registroList = document.getElementById('registro-list');
const registroMessages = document.getElementById('registro-messages');

let userData = null;
let saveAndUpdate = null;

export function initDiary(userDataRef, saveCallback) {
  userData = userDataRef;
  saveAndUpdate = saveCallback;

  registroForm.addEventListener('submit', e => {
    e.preventDefault();
    const texto = registroForm.registroText.value.trim();
    const animus = registroForm.animusSelect.value;
    const entreno = registroForm.checkEntreno.checked;
    if (!texto) {
      alert('Por favor escribe tu nota diaria.');
      return;
    }
    userData.registroDiario.push({
      fecha: (new Date()).toISOString(),
      texto, animus, entreno
    });
    saveAndUpdate();
    showMessage('registro-messages', 'Registro diario guardado.');
    registroForm.reset();
    renderRegistrosDiarios();
  });

  renderRegistrosDiarios();
}

export function renderRegistrosDiarios() {
  registroList.innerHTML = '';
  if (!userData.registroDiario.length) {
    registroList.innerHTML = '<p>No hay registros diarios aún.</p>';
    return;
  }
  userData.registroDiario.slice().reverse().forEach(reg => {
    const d = new Date(reg.fecha);
    const div = document.createElement('div');
    div.style.borderBottom = '1px solid #0ec261';
    div.style.padding = '8px 0';
    div.innerHTML = `
      <small style="color:#a9d6a4;">${d.toLocaleDateString()} ${d.toLocaleTimeString()}</small>
      <p>${reg.texto}</p>
      <p><strong>Estado ánimo:</strong> ${reg.animus || 'No especificado'} | <strong>Día entrenado:</strong> ${reg.entreno ? 'Sí' : 'No'}</p>
    `;
    registroList.appendChild(div);
  });
}
