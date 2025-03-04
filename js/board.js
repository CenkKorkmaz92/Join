/**
 * board.js
 * Main entry point that wires everything together.
 */

import { loadAllContacts } from './boardContacts.js';
import { fixSubtaskFormat } from './boardSubtask.js';
import {
  addTask,
  deleteTask,
  updateTaskStatusInFirebase
} from './boardTaskService.js';
import { createTaskCard } from './boardTaskCard.js';
import { openTaskModal, getCurrentTask } from './boardTaskModal.js';
import {
  enterEditMode,
  dismissEditMode,
  saveEditMode,
  toggleEditContactsDropdown
} from './boardEditMode.js';
import { addPlaceholdersToEmptyColumns } from './boardUtils.js';

/**
 * Loads tasks from Firebase, populates board columns, ensures format, etc.
 */
async function loadTasks() {
  const FIREBASE_TASKS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

  document.querySelectorAll('.board-list-column').forEach((c) => (c.innerHTML = ''));

  try {
    const response = await fetch(FIREBASE_TASKS_URL);
    const data = await response.json();
    if (!data) {
      console.log('No tasks found');
      addPlaceholdersToEmptyColumns();
      return;
    }
    const tasks = Object.entries(data).map(([firebaseId, task]) => ({
      firebaseId,
      ...task,
    }));
    tasks.forEach((t) => {
      fixSubtaskFormat(t); // ensures subtasks are objects, not strings
      t.status = t.status || 'toDo';
      placeCardInColumn(createTaskCard(t), t.status);
    });
    addPlaceholdersToEmptyColumns();
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

/**
 * Place card into the correct column by status.
 */
function placeCardInColumn(card, status) {
  const col = document.getElementById(status) || document.getElementById('toDo');
  const placeholder = col.querySelector('.board-task-element');
  if (placeholder) placeholder.remove();
  col.appendChild(card);
}

/**
 * Initialize drag & drop events on each board column.
 */
function initDragAndDrop() {
  const columns = document.querySelectorAll('.board-list-column');
  let originColumnId = null;

  columns.forEach((column) => {
    column.addEventListener('dragover', (e) => e.preventDefault());
    column.addEventListener('dragenter', (e) => {
      e.preventDefault();
      column.classList.add('hovered');
    });
    column.addEventListener('dragleave', () => {
      column.classList.remove('hovered');
    });
    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('hovered');
      const cardId = e.dataTransfer.getData('text/plain');
      const card = document.getElementById(cardId);
      if (card) {
        const placeholder = column.querySelector('.board-task-element');
        if (placeholder) placeholder.remove();
        column.appendChild(card);

        if (originColumnId && originColumnId !== column.id) {
          const oldCol = document.getElementById(originColumnId);
          if (oldCol && oldCol.querySelectorAll('.card-body').length === 0) {
            // If old column now empty, add placeholder
            addPlaceholdersToEmptyColumns();
          }
        }
        const firebaseId = cardId.replace('card-', '');
        updateTaskStatusInFirebase(firebaseId, column.id);
      }
    });
  });

  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card-body');
    if (card) {
      originColumnId = card.parentNode.id;
    }
  });
}

/**
 * Entry point when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllContacts();
  await loadTasks();
  initDragAndDrop();

  // Edit form: priority buttons
  document.getElementById('prioUrgentBtn').onclick = () => setPriorityInput('urgent');
  document.getElementById('prioMediumBtn').onclick = () => setPriorityInput('medium');
  document.getElementById('prioLowBtn').onclick = () => setPriorityInput('low');

  function setPriorityInput(prio) {
    document.getElementById('editPriorityInput').value = prio;
  }

  // Edit form: subtask events are in editMode.js, but wire the Save/Dismiss here
  document.getElementById('dismissEditBtn').onclick = dismissEditMode;
  document.getElementById('saveEditBtn').onclick = saveEditMode;

  // View mode: "Edit" & "Delete"
  document.getElementById('editTaskBtn').onclick = () => enterEditMode();
  document.getElementById('deleteTaskBtn').onclick = async () => {
    const task = getCurrentTask();
    if (task?.firebaseId) {
      await deleteTask(task.firebaseId);
      const modal = document.getElementById('viewTaskModal');
      modal.classList.add('hidden');
      loadTasks();
    }
  };

  // Toggle the assigned-contacts dropdown in edit mode
  document.getElementById('editDropdownToggle').onclick = toggleEditContactsDropdown;

  // --------------- ADDED EVENT LISTENER FOR "taskUpdated" ---------------
  document.addEventListener('taskUpdated', () => {
    loadTasks();
  });
});
