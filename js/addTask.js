/**
 * addTask.js
 * Main entry point for the "Add Task" page.
 */

import { fetchAllContacts, postNewTask } from './addTaskService.js';
import {
  setAllContacts,
  renderContactsDropdown,
  updateSelectedContactsUI,
  toggleContactsDropdown,
  closeDropdownIfClickedOutside,
  getSelectedContacts
} from './addTaskContacts.js';
import { initSubtaskEvents } from './addTaskSubtasks.js';
import {
  initFormValidation,
  initFieldClearing,
  clearAllFields
} from './addTaskValidation.js';

/**
 * Initializes the Add Task page once the DOM is ready,
 * fetching contacts and setting up UI/event handlers.
 */
document.addEventListener('DOMContentLoaded', async () => {
  setupDOMReferences();
  initFormValidation();
  initFieldClearing();
  initPriorityButtons();
  initDropdownEvents();
  initSubtaskEvents();

  try {
    const data = await fetchAllContacts();
    const contactsArray = mapContactsData(data);
    setAllContacts(contactsArray);
    renderContactsDropdown(
      document.getElementById('contactsDropdownList'),
      document.getElementById('dropdownPlaceholder')
    );
  } catch (error) {
  }
});

/**
 * Sets up DOM references or event listeners for various UI elements.
 */
function setupDOMReferences() {
  document.getElementById('titleInput').addEventListener('input', () => { });
}

/**
 * Maps the raw Firebase contacts data into an array of contact objects
 * with 'id' instead of the Firebase push key.
 * @param {Object} data - The raw data from Firebase.
 * @returns {Array} An array of contact objects.
 */
function mapContactsData(data) {
  return Object.entries(data).map(([pushKey, obj]) => ({
    id: pushKey,
    fullName: obj.fullName,
    color: obj.color,
    initials: obj.initials
  }));
}

/**
 * Initializes click handlers for priority selection buttons.
 */
function initPriorityButtons() {
  const prioOptions = document.querySelectorAll('.prio-option');
  prioOptions.forEach(option => {
    option.addEventListener('click', () => {
      prioOptions.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
}

/**
 * Initializes dropdown toggle and outside-click close logic.
 */
function initDropdownEvents() {
  const toggleEl = document.getElementById('dropdownToggle');
  const arrowEl = document.getElementById('dropdownArrow');
  const listEl = document.getElementById('contactsDropdownList');
  const placeholderEl = document.getElementById('dropdownPlaceholder');

  toggleEl.addEventListener('click', () => {
    toggleContactsDropdown(listEl, arrowEl, placeholderEl);
  });

  window.addEventListener('click', e => {
    closeDropdownIfClickedOutside(e, toggleEl, listEl, arrowEl);
  });
}

/**
 * Handles the "Create Task" button click event.
 * Prevents default form action, validates the form,
 * and creates a new task if valid.
 * @param {Event} e - The click event.
 */
function createTaskBtnClicked(e) {
  e.preventDefault();
  if (!isFormValid()) {
    alert('Please fill in all required fields.');
    return;
  }
  const newTask = buildTaskData();
  postNewTask(newTask)
    .then(res => showSuccessAndRedirect(res))
    .catch(() => alert('Error adding task. Please try again.'));
}

/**
 * Checks if the required fields (title, due date, category) are filled.
 * @returns {boolean} True if valid, otherwise false.
 */
function isFormValid() {
  const title = document.getElementById('titleInput').value.trim();
  const date = document.getElementById('dueDateInput').value;
  const category = document.getElementById('categorySelect').value;
  return Boolean(title && date && category);
}

/**
 * Builds a task object from the form fields, including
 * assigned contacts and subtasks.
 * @returns {Object} A new task object ready to be sent to the server.
 */
function buildTaskData() {
  const title = document.getElementById('titleInput').value.trim();
  const description = document.getElementById('descriptionInput').value.trim();
  const dueDate = document.getElementById('dueDateInput').value;
  const category = document.getElementById('categorySelect').value;
  const selectedPrio = document.querySelector('.prio-option.selected')?.dataset.prio || 'medium';

  const subtaskItems = document.querySelectorAll('#subtask-list li .subtask-text');
  const subtasks = Array.from(subtaskItems).map(el =>
    el.textContent.replace(/^•\s*/, '').trim()
  );

  const assignedTo = getSelectedContacts().map(c => ({
    id: c.id,
    fullName: c.fullName,
    initials: c.initials,
    color: c.color
  }));

  return {
    title,
    description,
    assignedTo,
    dueDate,
    priority: selectedPrio,
    category,
    subtasks,
    createdAt: new Date().toISOString()
  };
}

/**
 * Displays a success popup, then redirects the user to the board page.
 * @param {Object} responseData - The response data from the server (optional).
 */
function showSuccessAndRedirect(responseData) {
  const popup = document.getElementById('popupSuccess');
  popup.style.display = 'flex';
  setTimeout(() => {
    popup.style.display = 'none';
    window.location.href = 'board.html';
  }, 1000);
  clearAllFields();
}

/**
 * Attaches the "Create Task" button click handler if the button exists.
 */
const createBtn = document.querySelector('.create-btn');
if (createBtn) {
  createBtn.addEventListener('click', createTaskBtnClicked);
}
