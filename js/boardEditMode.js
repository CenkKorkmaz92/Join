/**
 * boardEditMode.js
 */
import { getCurrentTask, openTaskModal } from './boardTaskModal.js';
import { allContacts } from './boardContacts.js';
import { patchTask } from './boardTaskService.js';

let editAssignedTo = [];

/**
 * Enter edit mode.
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
 * Dismiss edit mode, revert to view mode of the same task.
 */
export function dismissEditMode() {
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('viewModeContainer').style.display = 'block';
    openTaskModal(getCurrentTask());
}

/**
 * Save changes, re-open the big card in view mode, and dispatch "taskUpdated".
 */
export async function saveEditMode() {
    const task = getCurrentTask();

    task.title = document.getElementById('editTitleInput').value;
    task.description = document.getElementById('editDescriptionInput').value;
    task.dueDate =
        document.getElementById('editDueDateInput').value || 'No date set';
    task.priority = document.getElementById('editPriorityInput').value || 'medium';
    task.assignedTo = editAssignedTo;
    // Note: We do NOT overwrite task.status; we keep whatever is in currentTask.status

    await patchTask(task.firebaseId, task);

    // Return to view mode
    document.getElementById('editFormContainer').style.display = 'none';
    document.getElementById('viewModeContainer').style.display = 'block';
    openTaskModal(task);

    // Let board.js re-fetch small cards
    document.dispatchEvent(new CustomEvent('taskUpdated'));
}

export function highlightPriorityButton(priority) {
    ['prioUrgentBtn', 'prioMediumBtn', 'prioLowBtn'].forEach((id) => {
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

// The rest is subtask & assigned-contacts logic (unchanged)...


// ---------------------------------------------------------------------------
// Subtask Editing
// ---------------------------------------------------------------------------
function initEditSubtasks(task) {
    if (!task.subtasks) {
        task.subtasks = [];
    }
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
    subtasks.forEach((sub, i) => {
        list.appendChild(createSubtaskListItem(sub, i, subtasks));
    });
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

function getSubtaskListItem(index) {
    const listItems = document.querySelectorAll('.edit-subtask-item');
    return listItems[index];
}

function createInlineInput(text) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.classList.add('subtask-edit-input');
    return input;
}

function finishEditing(input, listItem, index, subtasks) {
    const newText = input.value.trim();
    if (newText) subtasks[index].text = newText;
    const newSpan = document.createElement('span');
    newSpan.classList.add('subtask-text');
    newSpan.textContent = subtasks[index].text;
    listItem.replaceChild(newSpan, input);
}

function attachFinishEditingListeners(input, listItem, index, subtasks) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishEditing(input, listItem, index, subtasks);
    });
    input.addEventListener('blur', () => finishEditing(input, listItem, index, subtasks));
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

// ---------------------------------------------------------------------------
// Assigned Contacts in Edit
// ---------------------------------------------------------------------------
function initAssignedContacts(task) {
    editAssignedTo = task.assignedTo
        ? JSON.parse(JSON.stringify(task.assignedTo))
        : [];
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
        checkbox.checked = editAssignedTo.some(
            (c) => c.firebaseId === contact.firebaseId
        );
        checkbox.onchange = () => toggleEditContact(contact);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(contact.fullName));
        list.appendChild(label);
    });
}

function toggleEditContact(contact) {
    const index = editAssignedTo.findIndex(
        (c) => c.firebaseId === contact.firebaseId
    );
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

/** Toggles the dropdown list for assigned-contacts in edit mode. */
export function toggleEditContactsDropdown() {
    const dropdown = document.getElementById('editContactsDropdownList');
    dropdown.classList.toggle('hidden');
}
