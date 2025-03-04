/**
 * addTaskValidation.js
 * Form validation and clearing logic.
 */

import { updateSelectedContactsUI, getSelectedContacts } from './addTaskContacts.js';
import { initSubtaskEvents } from './addTaskSubtasks.js';

export function initFormValidation() {
    ['titleInput', 'dueDateInput', 'categorySelect'].forEach((id) => {
        const el = document.getElementById(id);
        el.addEventListener('input', validateForm);
        el.addEventListener('change', validateForm);
    });
    validateForm();
}

/**
 * Disables/enables the "Create Task" button based on required fields.
 */
function validateForm() {
    const title = document.getElementById('titleInput').value.trim();
    const date = document.getElementById('dueDateInput').value;
    const category = document.getElementById('categorySelect').value;
    const createBtn = document.querySelector('.create-btn');
    createBtn.disabled = !(title && date && category);
}

/**
 * Clears all form fields, subtasks, and selected contacts.
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
    validateForm(); // re-check form
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
    getSelectedContacts().length = 0; // clear array in place
    updateSelectedContactsUI();
}

export function initFieldClearing() {
    document
        .getElementById('clear-all-fields-btn')
        .addEventListener('click', (e) => {
            e.preventDefault();
            clearAllFields();
        });
    initSubtaskEvents();
}
