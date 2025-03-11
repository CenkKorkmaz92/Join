/**
 * board.js
 * Main entry point that wires everything together.
 */

import { loadAllContacts } from './boardContacts.js';
import { fixSubtaskFormat } from './boardSubtask.js';
import { addTask, deleteTask, updateTaskStatusInFirebase } from './boardTaskService.js';
import { createTaskCard } from './boardTaskCard.js';
import { openTaskModal, getCurrentTask } from './boardTaskModal.js';
import { enterEditMode, dismissEditMode, saveEditMode, toggleEditContactsDropdown } from './boardEditMode.js';
import { addPlaceholdersToEmptyColumns } from './boardUtils.js';

/**
 * Loads tasks from Firebase, populates board columns, ensures correct format, etc.
 */
async function loadTasks() {
  const FIREBASE_TASKS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

  document.querySelectorAll('.board-list-column').forEach((c) => (c.innerHTML = ''));

  try {
    const response = await fetch(FIREBASE_TASKS_URL);
    const data = await response.json();
    if (!data) {
      addPlaceholdersToEmptyColumns();
      return;
    }
    const tasks = Object.entries(data).map(([firebaseId, task]) => ({
      firebaseId,
      ...task,
    }));
    tasks.forEach((t) => {
      fixSubtaskFormat(t);
      t.status = t.status || 'toDo';
      placeCardInColumn(createTaskCard(t), t.status);
    });
    addPlaceholdersToEmptyColumns();
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

/**
 * Places a task card into the appropriate column by status.
 * @param {HTMLElement} card - The task card element.
 * @param {string} status - The task status (toDo, inProgress, etc.).
 */
function placeCardInColumn(card, status) {
  const col = document.getElementById(status) || document.getElementById('toDo');
  col.querySelector('.board-task-element')?.remove();
  col.appendChild(card);
}

/**
 * Initializes drag & drop functionality for board columns.
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
    column.addEventListener('dragleave', () => column.classList.remove('hovered'));
    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('hovered');
      const cardId = e.dataTransfer.getData('text/plain');
      const card = document.getElementById(cardId);
      if (card) {
        column.querySelector('.board-task-element')?.remove();
        column.appendChild(card);
        if (originColumnId && originColumnId !== column.id) {
          addPlaceholdersToEmptyColumns();
        }
        updateTaskStatusInFirebase(cardId.replace('card-', ''), column.id);
      }
    });
  });

  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card-body');
    if (card) originColumnId = card.parentNode.id;
  });
}

/**
 * Filters tasks based on search input.
 */
function filterTasks() {
  const searchText = getSearchText();
  const allCards = document.querySelectorAll('.card-body');
  let hasResults = false;

  allCards.forEach(card => {
    const match = matchesSearch(card, searchText);
    card.style.display = match ? 'block' : 'none';
    hasResults = hasResults || match;
  });

  toggleNoResultsMessage(hasResults, searchText);
}

/**
 * Retrieves the search input value.
 * @returns {string} The lowercase search text.
 */
function getSearchText() {
  return document.querySelector('.input-container input').value.toLowerCase();
}

/**
 * Checks if a card matches the search query.
 * @param {HTMLElement} card - The task card element.
 * @param {string} searchText - The search query.
 * @returns {boolean} True if the card matches, otherwise false.
 */
function matchesSearch(card, searchText) {
  return card.querySelector('.headline').textContent.toLowerCase().includes(searchText) ||
    card.querySelector('.info').textContent.toLowerCase().includes(searchText);
}

/**
 * Displays or removes the 'No results found' message.
 * @param {boolean} hasResults - Whether tasks match the search.
 * @param {string} searchText - The search query.
 */
function toggleNoResultsMessage(hasResults, searchText) {
  document.querySelectorAll('.board-list-column').forEach(col => {
    col.querySelector('.no-results')?.remove();
    if (!hasResults && searchText) {
      const msg = document.createElement('div');
      msg.classList.add('no-results');
      msg.textContent = 'No matching tasks found';
      col.appendChild(msg);
    }
  });
}

/**
 * Initializes event listeners on DOM load.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllContacts();
  await loadTasks();
  initDragAndDrop();

  document.querySelector('.input-container input')?.addEventListener('input', filterTasks);

  document.getElementById('prioUrgentBtn').onclick = () => setPriorityInput('urgent');
  document.getElementById('prioMediumBtn').onclick = () => setPriorityInput('medium');
  document.getElementById('prioLowBtn').onclick = () => setPriorityInput('low');

  function setPriorityInput(prio) {
    document.getElementById('editPriorityInput').value = prio;
  }

  document.getElementById('dismissEditBtn').onclick = dismissEditMode;
  document.getElementById('saveEditBtn').onclick = saveEditMode;
  document.getElementById('editTaskBtn').onclick = () => enterEditMode();
  document.getElementById('deleteTaskBtn').onclick = async () => {
    const task = getCurrentTask();
    if (task?.firebaseId) {
      await deleteTask(task.firebaseId);
      document.getElementById('viewTaskModal').classList.add('hidden');
      loadTasks();
    }
  };
  document.getElementById('editDropdownToggle').onclick = toggleEditContactsDropdown;
  document.addEventListener('taskUpdated', loadTasks);
});
