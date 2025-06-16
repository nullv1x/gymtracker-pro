import { showMessage, calculateIMC, getIMCDescription } from './ui.js';

const progForm = document.getElementById('progreso-form');
const imcInput = document.getElementById('imcInput');
const progresoMessages = document.getElementById('progreso-messages');
const ctxWeight = document.getElementById('weightChart').getContext('2d');
let weightChart = null;

let userData = null;
let saveAndUpdate = null;

export function initProgress(userDataRef, saveCallback) {
  userData = userDataRef;
  saveAndUpdate = saveCallback;

  progForm.peso.addEventListener('input', updateIMC);
  progForm.altura.addEventListener('input', updateIMC);

  progForm.addEventListener('submit', e => {
    e.preventDefault();
    const peso = parseFloat(progForm.peso.value);
    const altura = parseFloat(progForm.altura.value);
    const grasa = parseFloat(progForm.grasa.value);
    if (isNaN(peso) || isNaN(altura) || peso < 20 || altura < 50) {
      alert('Por favor ingresa valores válidos para peso y altura.');
      return;
    }
    userData.progreso.push({
      fecha: (new Date()).toISOString(),
      peso,
      altura,
      grasa: isNaN(grasa) ? null : grasa
    });
    saveAndUpdate();
    showMessage('progreso-messages', 'Progreso guardado correctamente.');
    renderProgresoChart();
    progForm.reset();
    imcInput.value = '';
  });

  renderProgresoChart();
}

function updateIMC() {
  const peso = parseFloat(progForm.peso.value);
  const altura = parseFloat(progForm.altura.value);
  const imc = calculateIMC(peso, altura);
  imcInput.value = imc || '';
}

export function renderProgresoChart() {
  if (!userData.progreso.length) {
    if (weightChart) {
      weightChart.destroy();
      weightChart = null;
    }
    return;
  }
  const labels = userData.progreso.map(p => new Date(p.fecha).toLocaleDateString());
  const dataPeso = userData.progreso.map(p => p.peso);

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
