// UI utilities module
export function showMessage(elementId, message, duration = 4000) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  setTimeout(() => {
    el.textContent = '';
  }, duration);
}

export function toggleModal(show) {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = show ? 'flex' : 'none';
}

export function applyDarkMode(enabled) {
  if (enabled) {
    document.documentElement.style.setProperty('--bg-color', '#121212');
    document.documentElement.style.setProperty('--text-color', '#e0e6f0');
    document.body.style.background = 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)';
  } else {
    document.documentElement.style.removeProperty('--bg-color');
    document.documentElement.style.removeProperty('--text-color');
    document.body.style.background = '';
  }
}

export function calculateIMC(peso, alturaCm) {
  if (!peso || !alturaCm) return null;
  const alturaM = alturaCm / 100;
  return (peso / (alturaM * alturaM)).toFixed(1);
}

export function getIMCDescription(imc) {
  const val = parseFloat(imc);
  if (val < 18.5) return 'Bajo peso';
  if (val < 25) return 'Normal';
  if (val < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export function validateEmail(email) {
  // Simple regex for email validation
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
