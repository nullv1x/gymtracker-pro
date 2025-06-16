import { fillPerfilForm, initProfileForm } from './profile.js';
import { initRoutines, renderRutinas } from './routines.js';
import { initProgress, renderProgresoChart } from './progress.js';
import { initDiary, renderRegistrosDiarios } from './diary.js';
import { applyDarkMode, showMessage } from './ui.js';

const navLinks = document.querySelectorAll('nav a[data-section]');
const sections = document.querySelectorAll('.content-section');

const localStorageKey = 'gymUserData';

let currentUserData = null;

function loadUserData() {
  const dataJson = localStorage.getItem(localStorageKey);
  if (dataJson) {
    try {
      return JSON.parse(dataJson);
    } catch {
      return getDefaultUserData();
    }
  }
  return getDefaultUserData();
}

function saveUserData(data) {
  localStorage.setItem(localStorageKey, JSON.stringify(data));
}

function getDefaultUserData() {
  return {
    perfil: {
      nombre: '',
      edad: '',
      genero: '',
      pesoInicial: '',
      objetivo: '',
      recordatorios: '',
      modoOscuro: false,
      email: ''
    },
    progreso: [],
    rutinas: [],
    registroDiario: [],
  };
}

function showAppSections(show) {
  sections.forEach(s => {
    s.style.display = show ? 'block' : 'none';
  });
  navLinks.forEach(link => {
    if(show) {
      link.removeAttribute('disabled');
    } else {
      link.setAttribute('disabled', 'true');
    }
  });
}

function activateSection(sectionId) {
  sections.forEach(s => s.id === sectionId ? s.classList.add('active') : s.classList.remove('active'));
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    if(link.hasAttribute('disabled')) return;
    const sectionId = link.getAttribute('data-section');
    activateSection(sectionId);
  });
});

function updateDashboard() {
  if (!currentUserData) return;
  let rutinaHoy = currentUserData.rutinas.find(r => !r.completada);
  if (!rutinaHoy) rutinaHoy = currentUserData.rutinas[0] || null;
  const rutinaElem = document.getElementById('dashboard-rutina');
  if (rutinaHoy) {
    let ejerciciosHtml = rutinaHoy.ejercicios.slice(0, 3).map(ej => `${ej.nombre} (${ej.series}x${ej.reps})`).join(', ');
    if (rutinaHoy.ejercicios.length > 3) ejerciciosHtml += ', ...';
    rutinaElem.innerHTML = `<strong>${rutinaHoy.nombre} ${rutinaHoy.tipo ? '(' + rutinaHoy.tipo + ')' : ''}</strong><br/>Ejercicios: ${ejerciciosHtml || 'Sin ejercicios definidos.'}`;
  } else {
    rutinaElem.textContent = 'No tienes una rutina programada para hoy.';
  }
  const estadElem = document.getElementById('dashboard-estado-fisico');
  const ultimoProgreso = currentUserData.progreso.slice(-1)[0];
  if (ultimoProgreso) {
    const peso = ultimoProgreso.peso || 'N/A';
    const imc = (peso && ultimoProgreso.altura) ? (peso / ((ultimoProgreso.altura / 100) ** 2)).toFixed(1) : null;
    const imcText = imc ? `${imc} (${imc >= 30 ? 'Obesidad' : imc >= 25 ? 'Sobrepeso' : imc >= 18.5 ? 'Normal' : 'Bajo peso'})` : 'N/A';
    estadElem.innerHTML = `
      <p><strong>Peso:</strong> ${peso} kg</p>
      <p><strong>IMC:</strong> ${imcText}</p>`;
  } else {
    estadElem.innerHTML = 'Carga tus datos en la sección Progreso para ver tu estado.';
  }
  const objElem = document.getElementById('dashboard-objetivos');
  if (currentUserData.perfil.objetivo) {
    objElem.innerHTML = `<ul><li>Objetivo: ${currentUserData.perfil.objetivo}</li><li>Completar la rutina del día</li></ul>`;
  } else {
    objElem.textContent = 'No hay objetivos definidos. Puedes agregarlos en tu Perfil.';
  }
  applyDarkMode(currentUserData.perfil.modoOscuro);
}

function saveAndUpdate() {
  saveUserData(currentUserData);
  updateDashboard();
  renderRutinas();
  renderProgresoChart();
  renderRegistrosDiarios();
}

window.addEventListener('DOMContentLoaded', () => {
  currentUserData = loadUserData();
  fillPerfilForm(currentUserData.perfil);
  initProfileForm(currentUserData, saveAndUpdate);
  initRoutines(currentUserData, saveAndUpdate);
  initProgress(currentUserData, saveAndUpdate);
  initDiary(currentUserData, saveAndUpdate);

  updateDashboard();
  showAppSections(true);
  activateSection('dashboard');
});
