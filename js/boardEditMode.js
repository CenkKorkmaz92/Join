/**
 * boardEditMode.js
 * Handles switching the task modal to "edit mode" and saving changes.
 */

import { getCurrentTask, openTaskModal } from './boardTaskModal.js';
import { allContacts } from './boardContacts.js';
import { patchTask } from './boardTaskService.js';

/** Local state for assigned contacts in edit mode. */
let editAssignedTo = [];

/**
 * Enter edit mode (hide view container, show edit form, populate fields).
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
 * Dismiss changes and revert to view mode.
 */
export function dismissEditMode() {
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('viewModeContainer').style.display = 'block';
    openTaskModal(getCurrentTask());
}

/**
 * Save changes to Firebase, then revert to view mode.
 */
export async function saveEditMode() {
    const task = getCurrentTask();
    task.title = document.getElementById('editTitleInput').value;
    task.description = document.getElementById('editDescriptionInput').value;
    task.dueDate =
        document.getElementById('editDueDateInput').value || 'No date set';
    task.priority = document.getElementById('editPriorityInput').value || 'medium';
    task.assignedTo = editAssignedTo;

    await patchTask(task.firebaseId, task);

    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('viewModeContainer').style.display = 'block';
    openTaskModal(task);
}

/**
 * Highlight the correct priority button in the edit form.
 */
export function highlightPriorityButton(priority) {
    ['prioUrgentBtn', 'prioMediumBtn', 'prioLowBtn'].forEach((id) => {
        document.getElementById(id).classList.remove('selected');
    });
    if (priority === 'urgent') document.getElementById('prioUrgentBtn').classList.add('selected');
    if (priority === 'medium') document.getElementById('prioMediumBtn').classList.add('selected');
    if (priority === 'low') document.getElementById('prioLowBtn').classList.add('selected');
}

// -----------------------
// Subtask Editing
// -----------------------
function initEditSubtasks(task) {
    if (!task.subtasks) task.subtasks = [];
    populateEditSubtasksList(task.subtasks);

    document.getElementById('editAddSubtaskBtn').onclick = (e) => {
        e.preventDefault();
        addNewSubtask(task);
    };

    document.getElementById('editSubtaskInput').onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNewSubtask(task);
        }
    };
}

function populateEditSubtasksList(subtasks) {
    const list = document.getElementById('editSubtasksList');
    list.innerHTML = '';
    subtasks.forEach((sub, i) => list.appendChild(createSubtaskListItem(sub, i, subtasks)));
}

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

function createEditIcon(onClick) {
    const img = document.createElement('img');
    img.src = './assets/img/icons/board/edit.svg';
    img.alt = 'Edit subtask';
    img.classList.add('subtask-edit-icon');
    img.onclick = onClick;
    return img;
}

function createDeleteIcon(onClick) {
    const img = document.createElement('img');
    img.src = './assets/img/icons/addTask/delete_icon.svg';
    img.alt = 'Delete subtask';
    img.classList.add('subtask-delete-icon');
    img.onclick = onClick;
    return img;
}

function editSubtask(index, subtasks) {
    const oldText = subtasks[index].text;
    const newText = prompt('Edit subtask:', oldText);
    if (newText && newText.trim()) {
        subtasks[index].text = newText.trim();
        populateEditSubtasksList(subtasks);
    }
}

function deleteSubtask(index, subtasks) {
    subtasks.splice(index, 1);
    populateEditSubtasksList(subtasks);
}

function addNewSubtask(task) {
    const input = document.getElementById('editSubtaskInput');
    const text = input.value.trim();
    if (text) {
        task.subtasks.push({ text, done: false });
        populateEditSubtasksList(task.subtasks);
        input.value = '';
    }
}

// -----------------------
// Assigned Contacts in Edit
// -----------------------
function initAssignedContacts(task) {
    editAssignedTo = task.assignedTo ? JSON.parse(JSON.stringify(task.assignedTo)) : [];
    renderEditContactsDropdown();
    updateEditSelectedContactsContainer();
    document.getElementById('editContactsDropdownList').classList.add('hidden');
}

function renderEditContactsDropdown() {
    const list = document.getElementById('editContactsDropdownList');
    list.innerHTML = '';

    allContacts.forEach((contact) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `editContactCheckbox-${contact.firebaseId}`;
        checkbox.checked = editAssignedTo.some((c) => c.firebaseId === contact.firebaseId);
        checkbox.onchange = () => toggleEditContact(contact);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(contact.fullName));
        list.appendChild(label);
    });
}

function toggleEditContact(contact) {
    const index = editAssignedTo.findIndex((c) => c.firebaseId === contact.firebaseId);
    if (index === -1) {
        editAssignedTo.push(contact);
    } else {
        editAssignedTo.splice(index, 1);
    }
    updateEditSelectedContactsContainer();
}

function updateEditSelectedContactsContainer() {
    const container = document.getElementById('editSelectedContactsContainer');
    container.innerHTML = '';
    editAssignedTo.forEach((c) => {
        const chip = document.createElement('div');
        chip.classList.add('contact-chip');
        chip.style.backgroundColor = c.color || '#999';
        chip.textContent = c.initials || '?';
        container.appendChild(chip);
    });
}

/**
 * Toggle the dropdown list for assigned-contacts in edit mode.
 */
export function toggleEditContactsDropdown() {
    const dropdown = document.getElementById('editContactsDropdownList');
    dropdown.classList.toggle('hidden');
}
