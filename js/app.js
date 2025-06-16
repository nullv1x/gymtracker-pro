import { initAuth, getCurrentUserEmail, clearCurrentUserEmail, getUserData } from './auth.js';
import { toggleModal } from './ui.js';
import { fillPerfilForm, initProfileForm } from './profile.js';
import { initRoutines } from './routines.js';
import { initProgress } from './progress.js';
import { initDiary } from './diary.js';
import { applyDarkMode } from './ui.js';

const navLinks = document.querySelectorAll('nav a[data-section]');
const sections = document.querySelectorAll('.content-section');
const logoutBtn = document.getElementById('logoutBtn');

let currentUserEmail = null;
let currentUserData = null;

function showAppSections(show) {
  sections.forEach(s => {
    s.style.display = show ? 'block' : 'none';
  });
  logoutBtn.style.display = show ? 'inline-block' : 'none';
  navLinks.forEach(link => {
    if(show) {
      link.removeAttribute('disabled');
    } else {
      link.setAttribute('disabled', 'true');
    }
  });
}

logoutBtn.addEventListener('click', () => {
  clearCurrentUserEmail();
  location.reload();
});

function updateDashboard() {
  if (!currentUserData) return;
  // Aquí actualizas dashboard según currentUserData
  // Lógica sencilla para dashboard en tu app completa
  // ...
  applyDarkMode(currentUserData.perfil?.modoOscuro);
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

function initializeUser(email) {
  currentUserEmail = email;
  currentUserData = getUserData(email);
  if (!currentUserData) {
    alert('Error al cargar datos de usuario.');
    return;
  }
  fillPerfilForm(currentUserData.perfil);
  initProfileForm(currentUserEmail, currentUserData, updateDashboard);
  initRoutines(currentUserEmail, currentUserData, updateDashboard);
  initProgress(currentUserEmail, currentUserData, updateDashboard);
  initDiary(currentUserEmail, currentUserData);
  updateDashboard();
  showAppSections(true);
  activateSection('dashboard');
  toggleModal(false);
}

window.addEventListener('DOMContentLoaded', () => {
  const email = getCurrentUserEmail();
  initAuth(initializeUser);
  if (!email) {
    // No sesión activa, mostrar modal login/registro
    toggleModal(true);
    showAppSections(false);
  } else {
    initializeUser(email);
  }
});
