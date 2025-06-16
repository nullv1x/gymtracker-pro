import { showMessage, calculateIMC, getIMCDescription } from './ui.js';
import { saveUserData } from './auth.js';

const progForm = document.getElementById('progreso-form');
const imcInput = document.getElementById('imcInput');
const progresoMessages = document.getElementById('progreso-messages');
const ctxWeight = document.getElementById('weightChart').getContext('2d');
let weightChart = null;

let currentUserDataRef = null;
let currentUserEmailRef = null;

progForm.peso.addEventListener('input', updateIMC);
progForm.altura.addEventListener('input', updateIMC);

function updateIMC() {
  const peso = parseFloat(progForm.peso.value);
  const altura = parseFloat(progForm.altura.value);
  const imc = calculateIMC(peso, altura);
  imcInput.value = imc || '';
}

progForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!currentUserEmailRef) return;
  const peso = parseFloat(progForm.peso.value);
  const altura = parseFloat(progForm.altura.value);
  const grasa = parseFloat(progForm.grasa.value);
  if (isNaN(peso) || isNaN(altura) || peso < 20 || altura < 50) {
    alert('Por favor ingresa valores válidos para peso y altura.');
    return;
  }
  currentUserDataRef.progreso.push({
    fecha: (new Date()).toISOString(),
    peso,
    altura,
    grasa: isNaN(grasa) ? null : grasa
  });
  saveUserData(currentUserEmailRef, currentUserDataRef);
  showMessage('progreso-messages', 'Progreso guardado correctamente.');
  renderProgresoChart();
  updateDashboardCallback?.();
  progForm.reset();
  imcInput.value = '';
});

let updateDashboardCallback = null;

export function initProgress(currentUserEmail, currentUserData, updateDashboardFn) {
  currentUserDataRef = currentUserData;
  currentUserEmailRef = currentUserEmail;
  updateDashboardCallback = updateDashboardFn;
  renderProgresoChart();
}

export function renderProgresoChart() {
  if (!currentUserDataRef.progreso.length) {
    if (weightChart) {
      weightChart.destroy();
      weightChart = null;
    }
    return;
  }
  const labels = currentUserDataRef.progreso.map(p => new Date(p.fecha).toLocaleDateString());
  const dataPeso = currentUserDataRef.progreso.map(p => p.peso);

  if (weightChart) {
    weightChart.data.labels = labels;
    weightChart.data.datasets[0].data = dataPeso;
    weightChart.update();
  } else {
    weightChart = new Chart(ctxWeight, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso (kg)',
          data: dataPeso,
          borderColor: '#0ec261',
          backgroundColor: 'rgba(14,194,97,.3)',
          borderWidth: 3,
          fill: true,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#0ec261' } }
        },
        scales: {
          x: {
            ticks: { color: '#a9d6a4' },
            grid: { color: '#122122' }
          },
          y: {
            ticks: { color: '#a9d6a4' },
            grid: { color: '#122122' },
            beginAtZero: true
          }
        }
      }
    });
  }
}
