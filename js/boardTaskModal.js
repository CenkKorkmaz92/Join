/**
 * boardTaskModal.js
 * When opening the big card, we fetch the latest task from Firebase
 * so we always have the correct status (column) and other fields.
 */

import { toggleSubtaskDone } from './boardSubtask.js';
import { updateCardProgress } from './boardTaskCard.js';
import { patchTask } from './boardTaskService.js';
import { openModal } from './boardUtils.js';

let currentTask = null;

/** Returns the in-memory task object currently displayed in the big card. */
export function getCurrentTask() {
    return currentTask;
}

/** Sets the in-memory task object. */
export function setCurrentTask(task) {
    currentTask = task;
}

/**
 * Fetch a single task by firebaseId from Firebase.
 */
async function fetchTaskFromFirebase(firebaseId) {
    const url = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data) return null;
        return { firebaseId, ...data };
    } catch (err) {
        console.error('Error fetching single task:', err);
        return null;
    }
}

/**
 * Opens the big card in view mode, always fetching the latest task from Firebase.
 */
export async function openTaskModal(task) {
    const latestTask = await fetchTaskFromFirebase(task.firebaseId);
    if (!latestTask) {
        console.warn('Task not found in Firebase. Possibly deleted?');
        return;
    }
    setCurrentTask(latestTask);
    document.getElementById('viewModeContainer').style.display = 'block';
    document.getElementById('editFormContainer').style.display = 'none';
    setCategoryBadge(latestTask.category);
    setTitleDescription(latestTask.title, latestTask.description);
    setDueDate(latestTask.dueDate);
    setPriority(latestTask.priority);
    setAssigned(latestTask.assignedTo);
    setSubtasks(latestTask);
    openModal('viewTaskModal');
}

/** The rest is your original logic for updating the big card's fields. */

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
