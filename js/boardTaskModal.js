/**
 * boardTaskModal.js
 * Controls the large modal (view mode) showing task details.
 */

import { toggleSubtaskDone } from './boardSubtask.js';
import { updateCardProgress } from './boardTaskCard.js';
import { openModal, closeModal } from './boardUtils.js';

let currentTask = null;

export function getCurrentTask() {
    return currentTask;
}
export function setCurrentTask(task) {
    currentTask = task;
}

/**
 * Opens the larger "detail view" modal with data from the given task.
 */
export function openTaskModal(task) {
    setCurrentTask(task);

    document.getElementById('viewModeContainer').style.display = 'block';
    document.getElementById('editFormContainer').style.display = 'none';

    setCategoryBadge(task.category);
    setTitleDescription(task.title, task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setAssigned(task.assignedTo);
    setSubtasks(task);

    openModal('viewTaskModal');
}

function setCategoryBadge(category) {
    const catBadge = document.getElementById('taskCategoryBadge');
    catBadge.classList.remove('category-user', 'category-technical');
    catBadge.textContent = category || 'No category';

    if (category === 'user-story') catBadge.classList.add('category-user');
    if (category === 'technical-task') catBadge.classList.add('category-technical');
}

function setTitleDescription(title, desc) {
    document.getElementById('taskTitle').textContent = title || 'No title';
    document.getElementById('taskDescription').textContent = desc || 'No description';
}

function setDueDate(date) {
    document.getElementById('taskDueDate').textContent = date || 'No date set';
}

function setPriority(priority) {
    const el = document.getElementById('taskPriority');
    el.innerHTML = '';
    if (priority === 'urgent') {
        el.innerHTML = `Urgent <img src="./assets/img/icons/addTask/arrow_up_icon.svg" alt="Urgent"/>`;
    } else if (priority === 'medium') {
        el.innerHTML = `Medium <img src="./assets/img/icons/addTask/equal_icon.svg" alt="Medium"/>`;
    } else if (priority === 'low') {
        el.innerHTML = `Low <img src="./assets/img/icons/addTask/arrow_down_icon.svg" alt="Low"/>`;
    } else {
        el.textContent = priority || 'none';
    }
}

function setAssigned(assigned) {
    const assignedEl = document.getElementById('taskAssignedTo');
    assignedEl.innerHTML = '';
    if (!assigned || assigned.length === 0) {
        assignedEl.innerHTML = '<li>None</li>';
        return;
    }
    assigned.forEach((person) => {
        const li = document.createElement('li');
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.style.backgroundColor = person.color || '#999';
        avatar.textContent = person.initials || '??';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = person.fullName || 'No Name';
        li.appendChild(avatar);
        li.appendChild(nameSpan);
        assignedEl.appendChild(li);
    });
}

/**
 * Build the subtask checkboxes and attach toggle listeners.
 */
function setSubtasks(task) {
    const list = document.getElementById('taskSubtasks');
    list.innerHTML = '';
    if (!task.subtasks || task.subtasks.length === 0) {
        list.innerHTML = '<li>No subtasks</li>';
        return;
    }
    task.subtasks.forEach((s, i) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!s.done;
        checkbox.addEventListener('change', () =>
            toggleSubtaskDone(task, i, checkbox.checked, updateCardProgress)
        );
        const label = document.createElement('label');
        label.textContent = s.text;
        li.appendChild(checkbox);
        li.appendChild(label);
        list.appendChild(li);
    });
}
