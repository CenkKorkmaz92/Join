/**
 * boardTaskCard.js
 * Creates a draggable card (small card) for the board.
 */

import { openTaskModal } from './boardTaskModal.js';

function setCategoryBadge(card, category) {
    const categoryEl = card.querySelector('.category');
    categoryEl.textContent = category || 'No category';
    categoryEl.classList.remove('category-user', 'category-technical');

    if (category === 'user-story') {
        categoryEl.classList.add('category-user');
        categoryEl.textContent = 'User Story';
    } else if (category === 'technical-task') {
        categoryEl.classList.add('category-technical');
        categoryEl.textContent = 'Technical Task';
    }
}

function setPriorityIcon(card, priority) {
    const prioEl = card.querySelector('.prio');
    prioEl.innerHTML = '';
    if (priority === 'urgent') {
        prioEl.innerHTML = `<img src="./assets/img/icons/addTask/arrow_up_icon.svg" alt="Urgent" />`;
    } else if (priority === 'medium') {
        prioEl.innerHTML = `<img src="./assets/img/icons/addTask/equal_icon.svg" alt="Medium" />`;
    } else if (priority === 'low') {
        prioEl.innerHTML = `<img src="./assets/img/icons/addTask/arrow_down_icon.svg" alt="Low" />`;
    } else {
        prioEl.textContent = priority || 'none';
    }
}

function setSubtaskProgress(card, subtasks) {
    const progressEl = card.querySelector('.progress-and-subtask');
    const total = subtasks.length;
    if (total === 0) {
        progressEl.style.display = 'none';
        return;
    }
    progressEl.style.display = 'flex';
    const done = subtasks.filter((s) => s.done).length;
    card.querySelector('.subtask-counter').textContent = `${done}/${total} subtasks`;
    card.querySelector('.progressbar-fill').style.width = `${(done / total) * 100}%`;
}

function setAssignedChips(card, assigned) {
    const chipsContainer = card.querySelector('.chips');
    chipsContainer.innerHTML = '';
    if (!assigned || assigned.length === 0) return;

    // Maximum number of visible chips
    const maxVisibleChips = 4;

    // Show up to 4 chips
    assigned.slice(0, maxVisibleChips).forEach((contact) => {
        const chip = document.createElement('div');
        chip.classList.add('contact-chip');
        chip.style.backgroundColor = contact.color || '#999';
        chip.textContent = contact.initials || '?';
        chipsContainer.appendChild(chip);
    });

    // If there are more than 4 contacts, add a "+X" chip
    if (assigned.length > maxVisibleChips) {
        const remaining = assigned.length - maxVisibleChips;
        const plusChip = document.createElement('div');
        plusChip.classList.add('contact-chip');
        plusChip.style.backgroundColor = '#999';
        plusChip.textContent = `+${remaining}`;
        chipsContainer.appendChild(plusChip);
    }
}


/**
 * Creates and returns a draggable task card element.
 */
export function createTaskCard(task) {
    const template = document.getElementById('cardTemplate');
    const card = template.content.firstElementChild.cloneNode(true);
    card.id = 'card-' + task.firebaseId;
    card.draggable = true;

    // Title & description
    card.querySelector('.headline').textContent = task.title || 'No title';
    card.querySelector('.info').textContent = task.description || '';

    // Category, priority, subtasks, assigned
    setCategoryBadge(card, task.category);
    setPriorityIcon(card, task.priority);
    setSubtaskProgress(card, task.subtasks || []);
    setAssignedChips(card, task.assignedTo);

    // Drag events
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
        card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    // Click -> open modal
    card.addEventListener('click', () => openTaskModal(task));

    return card;
}

/**
 * Updates the small card's progress bar & counter after toggling subtasks.
 */
export function updateCardProgress(firebaseId, newSubtasks) {
    const card = document.getElementById('card-' + firebaseId);
    if (!card) return;
    setSubtaskProgress(card, newSubtasks);
}
