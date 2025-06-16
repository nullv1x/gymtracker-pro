import { showMessage } from './ui.js';

const rutinasList = document.getElementById('rutinas-list');
const btnAddRoutine = document.getElementById('btn-add-routine');

let userData = null;
let saveAndUpdate = null;
let modalRoutine = null;

export function initRoutines(userDataRef, saveCallback) {
  userData = userDataRef;
  saveAndUpdate = saveCallback;

  renderRutinas();
  btnAddRoutine.addEventListener('click', () => openRoutineEditor());
}

export function renderRutinas() {
  rutinasList.innerHTML = '';
  if (!userData.rutinas.length) {
    rutinasList.innerHTML = '<p>No tienes rutinas guardadas. Usa el botón para crear una.</p>';
    return;
  }
  userData.rutinas.forEach((rutina, idx) => {
    const div = document.createElement('div');
    div.className = 'routine-card';
    div.setAttribute('tabindex', '0');
    const controls = `
      <div class="routine-controls" aria-label="Controles de rutina">
        <button title="Editar rutina" aria-label="Editar rutina" data-action="edit" data-index="${idx}"><span class="material-icons">edit</span></button>
        <button title="Duplicar rutina" aria-label="Duplicar rutina" data-action="duplicate" data-index="${idx}"><span class="material-icons">content_copy</span></button>
        <button title="Eliminar rutina" aria-label="Eliminar rutina" data-action="delete" data-index="${idx}"><span class="material-icons">delete</span></button>
        <button title="${rutina.completada ? 'Marcar como no completada' : 'Marcar como completada'}" aria-label="Marcar completada" data-action="toggleComplete" data-index="${idx}">
          <span class="material-icons">${rutina.completada ? 'check_circle' : 'radio_button_unchecked'}</span>
        </button>
      </div>
    `;

    let ejerciciosList = '';
    if (rutina.ejercicios.length) {
      ejerciciosList = '<ul>' + rutina.ejercicios.map(ej => `<li>${ej.nombre} - ${ej.series}x${ej.reps} - Peso: ${ej.peso}kg - Descanso: ${ej.descanso}s</li>`).join('') + '</ul>';
    } else {
      ejerciciosList = '<p><em>Sin ejercicios añadidos</em></p>';
    }

    div.innerHTML = `
      <div class="routine-header">${rutina.nombre} ${rutina.tipo ? '(' + rutina.tipo + ')' : ''}${controls}</div>
      <div class="routine-exercises">${ejerciciosList}</div>
    `;
    rutinasList.appendChild(div);
  });

  rutinasList.querySelectorAll('button').forEach(btn => {
    btn.onclick = (ev) => {
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index);
      if (action === 'edit') {
        openRoutineEditor(index);
      } else if (action === 'delete') {
        deleteRoutine(index);
      } else if (action === 'toggleComplete') {
        toggleCompleteRoutine(index);
      } else if (action === 'duplicate') {
        duplicateRoutine(index);
      }
    };
  });
}

function openRoutineEditor(index) {
  if (modalRoutine) modalRoutine.remove();
  const rutina = (typeof index === 'number' && userData.rutinas[index]) ? userData.rutinas[index] : null;
  modalRoutine = document.createElement('div');
  modalRoutine.id = 'modalRoutine';
  modalRoutine.style.position = 'fixed';
  modalRoutine.style.inset = '0';
  modalRoutine.style.background = 'rgba(0,0,0,0.8)';
  modalRoutine.style.backdropFilter = 'blur(6px)';
  modalRoutine.style.display = 'flex';
  modalRoutine.style.justifyContent = 'center';
  modalRoutine.style.alignItems = 'center';
  modalRoutine.style.zIndex = '1600';

  const rutinaName = rutina ? rutina.nombre : '';
  const rutinaType = rutina ? rutina.tipo : '';
  const ejercicios = rutina ? rutina.ejercicios : [];

  modalRoutine.innerHTML = `
    <div style="background:#212f3f; border-radius:20px; padding:24px; width: 90%; max-width: 480px; max-height: 90vh; overflow-y: auto; color:#d4d9df;">
      <h2 style="color:#0ec261; margin-top:0; user-select:none;">${rutina ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h2>
      <form id="routine-form">
        <label for="routineNameInput">Nombre de Rutina</label>
        <input id="routineNameInput" type="text" value="${rutinaName}" required />
        <label for="routineTypeInput">Tipo (Push, Pull, Legs, Fullbody)</label>
        <input id="routineTypeInput" type="text" value="${rutinaType}" placeholder="Opcional" />
        <fieldset style="border:1px solid #0ec261; border-radius:12px; padding:14px; margin-bottom:12px;">
          <legend style="font-weight:600; color:#0ec261;">Ejercicios</legend>
          <div id="exercises-list">
            ${ejercicios.map((ej, i) => `
              <div class="exercise-item" style="border-bottom: 1px solid #0ec261; padding-bottom:8px; margin-bottom:8px;">
                <input required placeholder="Nombre ejercicio" value="${ej.nombre}" class="ex-name" style="width: 60%;" />
                <input type="number" min="1" max="99" value="${ej.series}" class="ex-series" placeholder="Series" style="width: 12%;" />
                <input type="number" min="1" max="99" value="${ej.reps}" class="ex-reps" placeholder="Reps" style="width: 12%;" />
                <input type="number" min="0" value="${ej.peso}" step="0.1" class="ex-peso" placeholder="Peso" style="width: 12%;" />
                <input type="number" min="0" max="600" value="${ej.descanso}" step="1" class="ex-descanso" placeholder="Descanso (s)" style="width: 20%;" />
                <button type="button" class="remove-exercise" style="background:none;border:none;color:#dc2626;font-weight:900;cursor:pointer;">✕</button>
              </div>
            `).join('')}
          </div>
          <button type="button" id="add-exercise-btn" style="background:#0ec261; font-weight:700; border:none; padding:8px 12px; border-radius:10px; cursor:pointer;">+ Añadir ejercicio</button>
        </fieldset>
        <div style="display:flex; justify-content: flex-end; gap: 16px;">
          <button type="button" id="cancel-routine-btn" style="background:#dc2626; color:white;">Cancelar</button>
          <button type="submit" style="background:#0ec261; color:#121212;">Guardar</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalRoutine);

  const exercisesList = modalRoutine.querySelector('#exercises-list');
  const addExerciseBtn = modalRoutine.querySelector('#add-exercise-btn');

  function addExerciseEmpty() {
    const div = document.createElement('div');
    div.className = 'exercise-item';
    div.style = 'border-bottom: 1px solid #0ec261; padding-bottom:8px; margin-bottom:8px;';
    div.innerHTML = `
      <input required placeholder="Nombre ejercicio" class="ex-name" style="width: 60%;" />
      <input type="number" min="1" max="99" class="ex-series" placeholder="Series" style="width: 12%;" />
      <input type="number" min="1" max="99" class="ex-reps" placeholder="Reps" style="width: 12%;" />
      <input type="number" min="0" step="0.1" class="ex-peso" placeholder="Peso" style="width: 12%;" />
      <input type="number" min="0" max="600" step="1" class="ex-descanso" placeholder="Descanso (s)" style="width: 20%;" />
      <button type="button" class="remove-exercise" style="background:none;border:none;color:#dc2626;font-weight:900;cursor:pointer;">✕</button>
    `;
    exercisesList.appendChild(div);
    div.querySelector('.remove-exercise').onclick = () => div.remove();
  }

  addExerciseBtn.onclick = addExerciseEmpty;

  modalRoutine.querySelectorAll('.remove-exercise').forEach(btn => {
    btn.onclick = () => btn.parentElement.remove();
  });

  modalRoutine.querySelector('#cancel-routine-btn').onclick = () => {
    modalRoutine.remove();
    modalRoutine = null;
  };

  modalRoutine.querySelector('#routine-form').onsubmit = e => {
    e.preventDefault();
    const nom = modalRoutine.querySelector('#routineNameInput').value.trim();
    if (!nom) {
      alert('Nombre de rutina es obligatorio.');
      return;
    }
    const tipo = modalRoutine.querySelector('#routineTypeInput').value.trim();
    const ejerciciosElems = [...exercisesList.querySelectorAll('.exercise-item')];
    const ejerciciosArr = [];
    for (const el of ejerciciosElems) {
      const nombre = el.querySelector('.ex-name').value.trim();
      const series = parseInt(el.querySelector('.ex-series').value);
      const reps = parseInt(el.querySelector('.ex-reps').value);
      const peso = parseFloat(el.querySelector('.ex-peso').value);
      const descanso = parseInt(el.querySelector('.ex-descanso').value);
      if (!nombre || isNaN(series) || isNaN(reps)) {
        alert('Completa correctamente todos los ejercicios.');
        return;
      }
      ejerciciosArr.push({
        nombre,
        series,
        reps,
        peso: isNaN(peso) ? 0 : peso,
        descanso: isNaN(descanso) ? 60 : descanso
      });
    }
    if (rutina) {
      userData.rutinas[index] = { nombre: nom, tipo, ejercicios: ejerciciosArr, completada: rutina.completada || false };
    } else {
      userData.rutinas.push({ nombre: nom, tipo, ejercicios: ejerciciosArr, completada: false });
    }
    saveAndUpdate();
    renderRutinas();
    modalRoutine.remove();
    modalRoutine = null;
    showMessage('perfil-messages', 'Rutina guardada correctamente.');
  };
}

function deleteRoutine(idx) {
  if (!confirm('¿Eliminar esta rutina? Esta acción no se puede deshacer.')) return;
  userData.rutinas.splice(idx, 1);
  saveAndUpdate();
  renderRutinas();
  showMessage('perfil-messages', 'Rutina eliminada.');
}

function toggleCompleteRoutine(idx) {
  userData.rutinas[idx].completada = !userData.rutinas[idx].completada;
  saveAndUpdate();
  renderRutinas();
}

function duplicateRoutine(idx) {
  const original = userData.rutinas[idx];
  const copia = JSON.parse(JSON.stringify(original));
  copia.nombre += ' (Copia)';
  copia.completada = false;
  userData.rutinas.push(copia);
  saveAndUpdate();
  renderRutinas();
  showMessage('perfil-messages', 'Rutina duplicada.');
}
