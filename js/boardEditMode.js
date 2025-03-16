/**
 * boardEditMode.js
 * Handles entering, dismissing, and saving edits for a task in the board view.
 */

import { getCurrentTask, openTaskModal } from './boardTaskModal.js';
import { allContacts } from './boardContacts.js';
import { patchTask } from './boardTaskService.js';

/** An array of contacts assigned to the current task in edit mode. */
let editAssignedTo = [];

/**
 * Enters edit mode for the currently selected task.
 * Hides the view mode container and shows the edit form.
 */
export function enterEditMode() {
    const task = getCurrentTask();
    document.getElementById('viewModeContainer').style.display = 'none';
    document.getElementById('editFormContainer').style.display = 'block';
    document.getElementById('editTitleInput').value = task.title || '';
    document.getElementById('editDescriptionInput').value = task.description || '';
    document.getElementById('editDueDateInput').value =
        task.dueDate && task.dueDate !== 'No date set' ? task.dueDate : '';
    const prio = task.priority || 'medium';
    document.getElementById('editPriorityInput').value = prio;
    highlightPriorityButton(prio);
    initEditSubtasks(task);
    initAssignedContacts(task);
}

/**
 * Dismisses edit mode and returns to the view mode of the current task.
 */
export function dismissEditMode() {
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('viewModeContainer').style.display = 'block';
    openTaskModal(getCurrentTask());
}

/**
 * Saves the edited task data to the server and returns to view mode.
 * Dispatches a "taskUpdated" event to allow the board to refresh.
 * @async
 */
export async function saveEditMode() {
    const task = getCurrentTask();
    task.title = document.getElementById('editTitleInput').value;
    task.description = document.getElementById('editDescriptionInput').value;
    task.dueDate = document.getElementById('editDueDateInput').value || 'No date set';
    task.priority = document.getElementById('editPriorityInput').value || 'medium';
    task.assignedTo = editAssignedTo;

    await patchTask(task.firebaseId, task);

    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('viewModeContainer').style.display = 'block';
    openTaskModal(task);
    document.dispatchEvent(new CustomEvent('taskUpdated'));
}

/**
 * Highlights the priority button (urgent, medium, or low) based on the given priority.
 * @param {string} priority - The task's priority (urgent, medium, or low).
 */
export function highlightPriorityButton(priority) {
    ['prioUrgentBtn', 'prioMediumBtn', 'prioLowBtn'].forEach(id => {
        document.getElementById(id).classList.remove('selected');
    });
    if (priority === 'urgent') {
        document.getElementById('prioUrgentBtn').classList.add('selected');
    } else if (priority === 'medium') {
        document.getElementById('prioMediumBtn').classList.add('selected');
    } else if (priority === 'low') {
        document.getElementById('prioLowBtn').classList.add('selected');
    }
}

/**
 * Initializes subtask editing features for the given task.
 * @param {Object} task - The current task object.
 */
function initEditSubtasks(task) {
    if (!task.subtasks) {
        task.subtasks = [];
    }
    populateEditSubtasksList(task.subtasks);
    document.getElementById('editAddSubtaskBtn').onclick = e => {
        e.preventDefault();
        addNewSubtask(task);
    };
    document.getElementById('editSubtaskInput').onkeypress = e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNewSubtask(task);
        }
    };
}

/**
 * Populates the edit subtasks list with the current subtasks.
 * @param {Array} subtasks - The array of subtask objects.
 */
function populateEditSubtasksList(subtasks) {
    const list = document.getElementById('editSubtasksList');
    list.innerHTML = '';
    subtasks.forEach((sub, i) => {
        list.appendChild(createSubtaskListItem(sub, i, subtasks));
    });
}

/**
 * Creates a list item for a single subtask with edit and delete icons.
 * @param {Object} subtask - The subtask object containing text and done status.
 * @param {number} index - The index of this subtask in the subtasks array.
 * @param {Array} subtasks - The array of subtask objects.
 * @returns {HTMLLIElement} The constructed list item element.
 */
function createSubtaskListItem(subtask, index, subtasks) {
    const li = document.createElement('li');
    li.classList.add('edit-subtask-item');

    const span = document.createElement('span');
    span.classList.add('subtask-text');
    span.textContent = subtask.text;

    const iconsDiv = document.createElement('div');
    iconsDiv.classList.add('subtask-item-icons');
    iconsDiv.appendChild(createEditIcon(() => editSubtask(index, subtasks)));
    iconsDiv.appendChild(createDeleteIcon(() => deleteSubtask(index, subtasks)));

    li.appendChild(span);
    li.appendChild(iconsDiv);
    return li;
}

/**
 * Creates an edit icon element for a subtask.
 * @param {Function} onClick - The function to call when the icon is clicked.
 * @returns {HTMLImageElement} The edit icon element.
 */
function createEditIcon(onClick) {
    const img = document.createElement('img');
    img.src = './assets/img/icons/board/edit.svg';
    img.alt = 'Edit subtask';
    img.classList.add('subtask-edit-icon');
    img.onclick = onClick;
    return img;
}

/**
 * Creates a delete icon element for a subtask.
 * @param {Function} onClick - The function to call when the icon is clicked.
 * @returns {HTMLImageElement} The delete icon element.
 */
function createDeleteIcon(onClick) {
    const img = document.createElement('img');
    img.src = './assets/img/icons/addTask/delete_icon.svg';
    img.alt = 'Delete subtask';
    img.classList.add('subtask-delete-icon');
    img.onclick = onClick;
    return img;
}

/**
 * Switches the specified subtask into inline edit mode.
 * @param {number} index - The index of the subtask in the array.
 * @param {Array} subtasks - The array of subtask objects.
 */
function editSubtask(index, subtasks) {
    const listItem = getSubtaskListItem(index);
    if (!listItem) return;
    const span = listItem.querySelector('.subtask-text');
    if (!span) return;
    const input = createInlineInput(subtasks[index].text);
    listItem.replaceChild(input, span);
    attachFinishEditingListeners(input, listItem, index, subtasks);
    input.focus();
    input.select();
}

/**
 * Retrieves the subtask list item element at the given index.
 * @param {number} index - The index of the subtask item.
 * @returns {HTMLLIElement|undefined} The list item or undefined if not found.
 */
function getSubtaskListItem(index) {
    const listItems = document.querySelectorAll('.edit-subtask-item');
    return listItems[index];
}

/**
 * Creates an inline text input for subtask editing.
 * @param {string} text - The current subtask text.
 * @returns {HTMLInputElement} The input element for editing.
 */
function createInlineInput(text) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.classList.add('subtask-edit-input');
    return input;
}

/**
 * Completes editing of a subtask by saving new text and restoring view mode.
 * @param {HTMLInputElement} input - The input element containing new text.
 * @param {HTMLLIElement} listItem - The list item element being edited.
 * @param {number} index - The index of the subtask in the array.
 * @param {Array} subtasks - The array of subtask objects.
 */
function finishEditing(input, listItem, index, subtasks) {
    const newText = input.value.trim();
    if (newText) subtasks[index].text = newText;
    const newSpan = document.createElement('span');
    newSpan.classList.add('subtask-text');
    newSpan.textContent = subtasks[index].text;
    listItem.replaceChild(newSpan, input);
}

/**
 * Attaches event listeners to finish subtask editing on Enter or blur.
 * @param {HTMLInputElement} input - The input element for subtask editing.
 * @param {HTMLLIElement} listItem - The list item being edited.
 * @param {number} index - The index of the subtask in the array.
 * @param {Array} subtasks - The array of subtask objects.
 */
function attachFinishEditingListeners(input, listItem, index, subtasks) {
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') finishEditing(input, listItem, index, subtasks);
    });
    input.addEventListener('blur', () => finishEditing(input, listItem, index, subtasks));
}

/**
 * Deletes a subtask from the array and repopulates the list.
 * @param {number} index - The index of the subtask to delete.
 * @param {Array} subtasks - The array of subtask objects.
 */
function deleteSubtask(index, subtasks) {
    subtasks.splice(index, 1);
    populateEditSubtasksList(subtasks);
}

/**
 * Adds a new subtask to the task and repopulates the list.
 * @param {Object} task - The current task object.
 */
function addNewSubtask(task) {
    const input = document.getElementById('editSubtaskInput');
    const text = input.value.trim();
    if (text) {
        task.subtasks.push({ text, done: false });
        populateEditSubtasksList(task.subtasks);
        input.value = '';
    }
}

/**
 * Initializes assigned contact editing for the given task.
 * @param {Object} task - The current task object.
 */
function initAssignedContacts(task) {
    editAssignedTo = task.assignedTo
        ? JSON.parse(JSON.stringify(task.assignedTo))
        : [];
    renderEditContactsDropdown();
    updateEditSelectedContactsContainer();
    document.getElementById('editContactsDropdownList').classList.add('hidden');
}

/**
 * Renders the edit contacts dropdown by listing all available contacts
 * with checkboxes to toggle assignment.
 */
function renderEditContactsDropdown() {
    const list = document.getElementById('editContactsDropdownList');
    list.innerHTML = '';
    allContacts.forEach(contact => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `editContactCheckbox-${contact.firebaseId}`;
        checkbox.checked = editAssignedTo.some(
            c => c.firebaseId === contact.firebaseId
        );
        checkbox.onchange = () => toggleEditContact(contact);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(contact.fullName));
        list.appendChild(label);
    });
}

/**
 * Toggles the assignment of a contact in edit mode.
 * @param {Object} contact - The contact object to toggle.
 */
function toggleEditContact(contact) {
    const index = editAssignedTo.findIndex(
        c => c.firebaseId === contact.firebaseId
    );
    if (index === -1) {
        editAssignedTo.push(contact);
    } else {
        editAssignedTo.splice(index, 1);
    }
    updateEditSelectedContactsContainer();
}

/**
 * Updates the container that shows which contacts are assigned to the task.
 */
function updateEditSelectedContactsContainer() {
    const container = document.getElementById('editSelectedContactsContainer');
    container.innerHTML = '';
    editAssignedTo.forEach(c => {
        const chip = document.createElement('div');
        chip.classList.add('contact-chip');
        chip.style.backgroundColor = c.color || '#999';
        chip.textContent = c.initials || '?';
        container.appendChild(chip);
    });
}

/**
 * Toggles the dropdown list for assigned contacts in edit mode.
 */
export function toggleEditContactsDropdown() {
    const dropdown = document.getElementById('editContactsDropdownList');
    dropdown.classList.toggle('hidden');
}
