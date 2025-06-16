// Módulo para gestionar autenticación: registro y login con localStorage

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerStep1 = document.getElementById('register-step1');
const registerStep2 = document.getElementById('register-step2');
const toggleToRegister = document.getElementById('toggleToRegister');
const toggleToLogin = document.getElementById('toggleToLogin');
const modalError = document.getElementById('modal-error');
const logoutBtn = document.getElementById('logoutBtn');

function getUsers() {
  return JSON.parse(localStorage.getItem('gymUsers') || '{}');
}

function saveUsers(usersObj) {
  localStorage.setItem('gymUsers', JSON.stringify(usersObj));
}

function getCurrentUserEmail() {
  return localStorage.getItem('gymCurrentUser');
}

function setCurrentUserEmail(email) {
  localStorage.setItem('gymCurrentUser', email);
}

function clearCurrentUserEmail() {
  localStorage.removeItem('gymCurrentUser');
}

function getUserData(email) {
  const users = getUsers();
  return users[email]?.data || null;
}

function saveUserData(email, data) {
  const users = getUsers();
  if (!users[email]) return false;
  users[email].data = data;
  saveUsers(users);
  return true;
}

function createUser(email, password, perfilDatos) {
  const users = getUsers();
  if (users[email]) return false; // Ya registrado
  users[email] = {
    password,
    data: getDefaultUserData(email, perfilDatos),
  };
  saveUsers(users);
  return true;
}

function validatePassword(email, password) {
  const users = getUsers();
  return users[email]?.password === password;
}

function getDefaultUserData(email, perfilDatos = {}) {
  return {
    perfil: {
      nombre: perfilDatos.nombre || '',
      edad: perfilDatos.edad || '',
      genero: perfilDatos.genero || '',
      pesoInicial: perfilDatos.pesoInicial || '',
      objetivo: perfilDatos.objetivo || '',
      recordatorios: '',
      modoOscuro: perfilDatos.modoOscuro || false,
      email: email || '',
    },
    progreso: [],
    rutinas: [],
    registroDiario: [],
  };
}

toggleToRegister.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'flex';
  toggleToRegister.style.display = 'none';
  toggleToLogin.style.display = 'block';
  modalError.textContent = '';
  document.getElementById('modalTitle').textContent = 'Crear Cuenta';
  // Inicializamos registro pasos
  if(registerStep1) registerStep1.style.display = 'block';
  if(registerStep2) registerStep2.style.display = 'none';
});

toggleToLogin.addEventListener('click', () => {
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
  toggleToRegister.style.display = 'block';
  toggleToLogin.style.display = 'none';
  modalError.textContent = '';
  document.getElementById('modalTitle').textContent = 'Iniciar Sesión';
  if(registerStep1) registerStep1.style.display = 'block';
  if(registerStep2) registerStep2.style.display = 'none';
});

export function initAuth(onLoginSuccess) {
  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.loginEmail.value.trim().toLowerCase();
    const pass = loginForm.loginPassword.value;
    modalError.textContent = '';
    if (!email || !pass) {
      modalError.textContent = 'Completa todos los campos.';
      return;
    }
    if (!validatePassword(email, pass)) {
      modalError.textContent = 'Email o contraseña incorrectos.';
      return;
    }
    setCurrentUserEmail(email);
    document.getElementById('modal').style.display = 'none';
    onLoginSuccess(email);
  });

  // Registro - PASO 1
  if(registerStep1){
    const btnNext = document.getElementById('registerStep1Next');
    btnNext.addEventListener('click', () => {
      modalError.textContent = '';
      const email = document.getElementById('regEmail1').value.trim().toLowerCase();
      const pass = document.getElementById('regPassword1').value;
      const passConf = document.getElementById('regPasswordConfirm1').value;
      if (!email || !pass || !passConf) {
        modalError.textContent = 'Completa todos los campos.';
        return;
      }
      if (pass.length < 6) {
        modalError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }
      if (pass !== passConf) {
        modalError.textContent = 'Las contraseñas no coinciden.';
        return;
      }
      const users = getUsers();
      if (users[email]) {
        modalError.textContent = 'El email ya está registrado.';
        return;
      }
      // Guardamos datos temporales en atributo dataset para paso 2
      registerForm.dataset.email = email;
      registerForm.dataset.password = pass;
      // Ocultamos paso1 y mostramos paso2
      registerStep1.style.display = 'none';
      registerStep2.style.display = 'block';
      modalError.textContent = '';
    });
  }

  // Registro - PASO 2 (datos perfil)
  if(registerStep2){
    const btnBack = document.getElementById('registerStep2Back');
    const btnSubmit = document.getElementById('registerStep2Submit');
    btnBack.addEventListener('click', () => {
      // Volver paso 1 cancelando datos perfil
      modalError.textContent = '';
      registerStep2.style.display = 'none';
      registerStep1.style.display = 'block';
    });
    btnSubmit.addEventListener('click', () => {
      modalError.textContent = '';
      const nombre = document.getElementById('regNombre2').value.trim();
      const edad = document.getElementById('regEdad2').value.trim();
      const genero = document.getElementById('regGenero2').value;
      const pesoInicial = document.getElementById('regPesoInicial2').value.trim();
      const objetivo = document.getElementById('regObjetivo2').value;
      const modoOscuro = document.getElementById('regModoOscuro2').checked;

      if (!nombre) {
        modalError.textContent = 'Por favor ingresa tu nombre.';
        return;
      }
      const email = registerForm.dataset.email;
      const password = registerForm.dataset.password;
      if (!email || !password) {
        modalError.textContent = 'Error interno: datos incompletos del registro.';
        return;
      }
      const perfilDatos = { nombre, edad, genero, pesoInicial, objetivo, modoOscuro };

      if (!createUser(email, password, perfilDatos)) {
        modalError.textContent = 'El email ya está registrado.';
        return;
      }
      setCurrentUserEmail(email);
      document.getElementById('modal').style.display = 'none';
      registerForm.dataset.email = '';
      registerForm.dataset.password = '';
      // Limpiar formulario paso 2
      document.getElementById('regNombre2').value = '';
      document.getElementById('regEdad2').value = '';
      document.getElementById('regGenero2').value = '';
      document.getElementById('regPesoInicial2').value = '';
      document.getElementById('regObjetivo2').value = '';
      document.getElementById('regModoOscuro2').checked = false;
      onLoginSuccess(email);
    });
  }

  logoutBtn.addEventListener('click', () => {
    clearCurrentUserEmail();
    location.reload();
  });
}

