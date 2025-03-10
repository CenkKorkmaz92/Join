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
  getSelectedContacts,
} from './addTaskContacts.js';
import { initSubtaskEvents, addSubtask } from './addTaskSubtasks.js';
import {
  initFormValidation,
  initFieldClearing,
  clearAllFields,
} from './addTaskValidation.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Initialize references & events
  setupDOMReferences();
  initFormValidation();
  initFieldClearing();
  initPriorityButtons();
  initDropdownEvents();
  initSubtaskEvents();

  // 2) Fetch contacts, render dropdown
  try {
    const data = await fetchAllContacts();
    const contactsArray = mapContactsData(data);
    setAllContacts(contactsArray);
    renderContactsDropdown(
      document.getElementById('contactsDropdownList'),
      document.getElementById('dropdownPlaceholder')
    );
  } catch (error) {
    console.warn('No contacts found or error fetching contacts:', error);
  }
});

function setupDOMReferences() {
  // Just rename the HTML inputs with IDs, if needed.
  document.getElementById('titleInput').addEventListener('input', () => { });
  // ...any other small rebindings...
}

/**
 * Converts the Firebase contact object into an array for rendering,
 * storing the Firebase key as "id".
 */
function mapContactsData(data) {
  return Object.entries(data).map(([pushKey, obj]) => ({
    id: pushKey,            // <-- use "id" as the field name (instead of "firebaseId")
    fullName: obj.fullName,
    color: obj.color,
    initials: obj.initials,
  }));
}

/**
 * Priority button selection logic.
 */
function initPriorityButtons() {
  const prioOptions = document.querySelectorAll('.prio-option');
  prioOptions.forEach((option) => {
    option.addEventListener('click', () => {
      prioOptions.forEach((o) => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
}

/**
 * Dropdown toggle and close-on-outside-click logic.
 */
function initDropdownEvents() {
  const toggleEl = document.getElementById('dropdownToggle');
  const arrowEl = document.getElementById('dropdownArrow');
  const listEl = document.getElementById('contactsDropdownList');
  const placeholderEl = document.getElementById('dropdownPlaceholder');

  toggleEl.addEventListener('click', () => {
    toggleContactsDropdown(listEl, arrowEl, placeholderEl);
  });

  window.addEventListener('click', (e) => {
    closeDropdownIfClickedOutside(e, toggleEl, listEl, arrowEl);
  });
}

/**
 * Gathers form data and pushes new task to Firebase.
 */
function createTaskBtnClicked(e) {
  e.preventDefault();
  if (!isFormValid()) {
    alert('Please fill in all required fields.');
    return;
  }
  const newTask = buildTaskData();
  postNewTask(newTask)
    .then((res) => showSuccessAndRedirect(res))
    .catch((err) => alert('Error adding task. Please try again.'));
}

/**
 * Checks required fields before attempting to create the task.
 */
function isFormValid() {
  const title = document.getElementById('titleInput').value.trim();
  const date = document.getElementById('dueDateInput').value;
  const category = document.getElementById('categorySelect').value;
  return Boolean(title && date && category);
}

/**
 * Builds the task object from form input values,
 * storing assigned contacts with "id" (not "firebaseId").
 */
function buildTaskData() {
  const title = document.getElementById('titleInput').value.trim();
  const description = document.getElementById('descriptionInput').value.trim();
  const dueDate = document.getElementById('dueDateInput').value;
  const category = document.getElementById('categorySelect').value;
  const selectedPrio = document.querySelector('.prio-option.selected')?.dataset.prio || 'medium';
  const subtaskItems = document.querySelectorAll('#subtask-list li .subtask-text');
  const subtasks = Array.from(subtaskItems).map((el) =>
    el.textContent.replace(/^•\s*/, '').trim()
  );

  // Now each selected contact is .id, not .firebaseId
  const assignedTo = getSelectedContacts().map((c) => ({
    id: c.id,                 // <-- store c.id
    fullName: c.fullName,
    initials: c.initials,
    color: c.color,
  }));

  return {
    title,
    description,
    assignedTo,
    dueDate,
    priority: selectedPrio,
    category,
    subtasks,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Show success popup, then redirect to board.
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

// Attach click listener for "Create Task" button
const createBtn = document.querySelector('.create-btn');
if (createBtn) {
  createBtn.addEventListener('click', createTaskBtnClicked);
}
