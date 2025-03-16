/**
 * addTaskValidation.js
 * Manages form validation and clearing logic without using native "disabled".
 */

import { updateSelectedContactsUI, getSelectedContacts } from './addTaskContacts.js';
import { initSubtaskEvents } from './addTaskSubtasks.js';

/**
 * Initializes validation by attaching event listeners to required fields,
 * toggling a "disabled" class on the Create Task button,
 * and highlighting empty fields if the button is clicked while "disabled."
 */
export function initFormValidation() {
    const requiredFields = ['titleInput', 'dueDateInput', 'categorySelect'];

    requiredFields.forEach((id) => {
        const el = document.getElementById(id);
        el.addEventListener('input', toggleCreateButtonState);
        el.addEventListener('change', toggleCreateButtonState);
    });

    // Initial check
    toggleCreateButtonState();

    // Handle clicks on the container (or the button itself)
    const container = document.getElementById('create-btn-container');
    container.addEventListener('click', (e) => {
        const createBtn = document.querySelector('.create-btn');
        // If the button has our "disabled" class, highlight empty fields
        if (createBtn.classList.contains('disabled')) {
            e.preventDefault();
            highlightEmptyFields();
        } else {
        }
    });
    removeErrorOnInput(requiredFields);
}

/**
 * Toggles the .disabled class on the button based on required fields.
 */
function toggleCreateButtonState() {
    const title = document.getElementById('titleInput').value.trim();
    const date = document.getElementById('dueDateInput').value.trim();
    const category = document.getElementById('categorySelect').value.trim();
    const createBtn = document.querySelector('.create-btn');

    if (title && date && category) {
        createBtn.classList.remove('disabled');
    } else {
        createBtn.classList.add('disabled');
    }
}

/**
 * Highlights empty fields by adding a red border.
 */
function highlightEmptyFields() {
    const titleInput = document.getElementById('titleInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const categorySelect = document.getElementById('categorySelect');

    if (!titleInput.value.trim()) {
        titleInput.classList.add('error');
    }
    if (!dueDateInput.value.trim()) {
        dueDateInput.classList.add('error');
    }
    if (!categorySelect.value.trim()) {
        categorySelect.classList.add('error');
    }
}

/**
 * Removes the red border once the user starts typing or changes a field.
 */
function removeErrorOnInput(fields) {
    fields.forEach((id) => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => el.classList.remove('error'));
        el.addEventListener('change', () => el.classList.remove('error'));
    });
}

/**
 * Clears all form fields, subtasks, and selected contacts, then re-checks validation.
 */
export function clearAllFields() {
    document.getElementById('titleInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('dueDateInput').value = '';
    document.getElementById('categorySelect').value = '';

    document.getElementById('subtask-list').innerHTML = '';
    document.getElementById('subtask-input').value = '';
    hideSubtaskEditingButtons();
    resetPrioritySelection();
    resetContacts();
    toggleCreateButtonState();
}

function hideSubtaskEditingButtons() {
    document.getElementById('confirm-subtask').classList.add('hidden');
    document.getElementById('clear-subtask').classList.add('hidden');
    document.getElementById('vector').classList.add('hidden');
    document.getElementById('add-subtask-btn').classList.remove('hidden');
}

function resetPrioritySelection() {
    const prioOptions = document.querySelectorAll('.prio-option');
    prioOptions.forEach((opt) => opt.classList.remove('selected'));
    const mediumPrio = document.querySelector('.prio-option[data-prio="medium"]');
    if (mediumPrio) mediumPrio.classList.add('selected');
}

function resetContacts() {
    getSelectedContacts().length = 0;
    updateSelectedContactsUI();
}

/**
 * Initializes subtask events and sets up the clear fields button.
 */
export function initFieldClearing() {
    document.getElementById('clear-all-fields-btn').addEventListener('click', (e) => {
        e.preventDefault();
        clearAllFields();
    });
    initSubtaskEvents();
}
