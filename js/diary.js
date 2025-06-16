import { showMessage } from './ui.js';
import { saveUserData } from './auth.js';

const registroForm = document.getElementById('registro-form');
const registroList = document.getElementById('registro-list');
const registroMessages = document.getElementById('registro-messages');

let currentUserDataRef = null;
let currentUserEmailRef = null;

registroForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentUserEmailRef) return;
  const texto = registroForm.registroText.value.trim();
  const animus = registroForm.animusSelect.value;
  const entreno = registroForm.checkEntreno.checked;
  if (!texto) {
    alert('Por favor escribe tu nota diaria.');
    return;
  }
  currentUserDataRef.registroDiario.push({
    fecha: (new Date()).toISOString(),
    texto, animus, entreno
  });
  saveUserData(currentUserEmailRef, currentUserDataRef);
  showMessage('registro-messages', 'Registro diario guardado.');
  registroForm.reset();
  renderRegistrosDiarios();
});

export function initDiary(currentUserEmail, currentUserData) {
  currentUserDataRef = currentUserData;
  currentUserEmailRef = currentUserEmail;
  renderRegistrosDiarios();
}

export function renderRegistrosDiarios() {
  registroList.innerHTML = '';
  if (!currentUserDataRef.registroDiario.length) {
    registroList.innerHTML = '<p>No hay registros diarios aún.</p>';
    return;
  }
  currentUserDataRef.registroDiario.slice().reverse().forEach(reg => {
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
