import { showMessage, applyDarkMode } from './ui.js';
import { saveUserData, getUserData } from './auth.js';

const perfilForm = document.getElementById('perfil-form');

export function fillPerfilForm(perfil) {
  perfilForm.nombre.value = perfil.nombre || '';
  perfilForm.email.value = perfil.email || '';
  perfilForm.edad.value = perfil.edad || '';
  perfilForm.genero.value = perfil.genero || '';
  perfilForm.pesoInicial.value = perfil.pesoInicial || '';
  perfilForm.objetivo.value = perfil.objetivo || '';
  perfilForm.recordatorios.value = perfil.recordatorios || '';
  perfilForm.modoOscuro.checked = !!perfil.modoOscuro;
}

export function initProfileForm(currentUserEmail, currentUserData, updateDashboardCallback) {
  fillPerfilForm(currentUserData.perfil);

  perfilForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const perfil = {
      nombre: perfilForm.nombre.value.trim(),
      email: perfilForm.email.value.trim().toLowerCase(),
      edad: perfilForm.edad.value.trim(),
      genero: perfilForm.genero.value,
      pesoInicial: perfilForm.pesoInicial.value.trim(),
      objetivo: perfilForm.objetivo.value,
      recordatorios: perfilForm.recordatorios.value.trim(),
      modoOscuro: perfilForm.modoOscuro.checked,
    };
    currentUserData.perfil = perfil;
    saveUserData(currentUserEmail, currentUserData);
    updateDashboardCallback();
    applyDarkMode(perfil.modoOscuro);
    showMessage('perfil-messages', 'Perfil guardado correctamente.');
  });
}
