/**
 * boardTaskCard.js
 * Creates a draggable task card for the board and adds a dropdown menu on the drag icon to move the card.
 */

import { openTaskModal } from './boardTaskModal.js';

/**
 * Sets the category badge on the card.
 * @param {HTMLElement} card - The card element.
 * @param {string} category - The task category.
 */
function setCategoryBadge(card, category) {
    const el = card.querySelector('.category');
    el.textContent = category || 'No category';
    el.classList.remove('category-user', 'category-technical');
    if (category === 'user-story') {
        el.classList.add('category-user');
        el.textContent = 'User Story';
    } else if (category === 'technical-task') {
        el.classList.add('category-technical');
        el.textContent = 'Technical Task';
    }
}

/**
 * Sets the priority icon on the card.
 * @param {HTMLElement} card - The card element.
 * @param {string} priority - The task priority.
 */
function setPriorityIcon(card, priority) {
    const el = card.querySelector('.prio');
    el.innerHTML = '';
    if (priority === 'urgent') {
        el.innerHTML = `<img src="./assets/img/icons/addTask/arrow_up_icon.svg" alt="Urgent" />`;
    } else if (priority === 'medium') {
        el.innerHTML = `<img src="./assets/img/icons/addTask/equal_icon.svg" alt="Medium" />`;
    } else if (priority === 'low') {
        el.innerHTML = `<img src="./assets/img/icons/addTask/arrow_down_icon.svg" alt="Low" />`;
    } else {
        el.textContent = priority || 'none';
    }
}

/**
 * Sets the subtask progress bar and counter.
 * @param {HTMLElement} card - The card element.
 * @param {Array} subtasks - Array of subtask objects.
 */
function setSubtaskProgress(card, subtasks) {
    const progressEl = card.querySelector('.progress-and-subtask');
    const total = subtasks.length;
    if (total === 0) {
        progressEl.style.display = 'none';
        return;
    }
    progressEl.style.display = 'flex';
    const done = subtasks.filter(s => s.done).length;
    card.querySelector('.subtask-counter').textContent = `${done}/${total} subtasks`;
    card.querySelector('.progressbar-fill').style.width = `${(done / total) * 100}%`;
}

/**
 * Creates a contact chip element.
 * @param {string} text - The text to display.
 * @param {string} color - The background color.
 * @returns {HTMLElement} The chip element.
 */
function createChip(text, color) {
    const chip = document.createElement('div');
    chip.classList.add('contact-chip');
    chip.style.backgroundColor = color;
    chip.textContent = text;
    return chip;
}

/**
 * Sets the assigned contact chips on the card.
 * @param {HTMLElement} card - The card element.
 * @param {Array} assigned - Array of contact objects.
 */
function setAssignedChips(card, assigned) {
    const container = card.querySelector('.chips');
    container.innerHTML = '';
    if (!assigned || !assigned.length) return;
    const max = 4;
    assigned.slice(0, max).forEach(c =>
        container.appendChild(createChip(c.initials || '?', c.color || '#999'))
    );
    if (assigned.length > max)
        container.appendChild(createChip(`+${assigned.length - max}`, '#999'));
}

/**
 * Opens a dropdown to move the card to another column.
 * @param {HTMLElement} card - The card element.
 * @param {HTMLElement} icon - The clicked icon element.
 */
function openMoveDropdown(card, icon) {
    const existing = document.querySelector('.move-dropdown');
    if (existing) existing.remove();
    const dropdown = document.createElement('div');
    dropdown.classList.add('move-dropdown');
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = 1000;
    const r = icon.getBoundingClientRect();
    dropdown.style.top = r.bottom + window.scrollY + 'px';
    dropdown.style.left = r.right + window.scrollX + 'px';
    dropdown.style.transform = 'translateX(-100%)';
    const cols = [
        { id: 'toDo', label: 'To Do' },
        { id: 'inProgress', label: 'In Progress' },
        { id: 'awaitFeedback', label: 'Await Feedback' },
        { id: 'done', label: 'Done' }
    ];
    cols.forEach(c => {
        const opt = document.createElement('div');
        opt.classList.add('move-dropdown-option');
        opt.textContent = c.label;
        opt.addEventListener('click', e => {
            e.stopPropagation();
            moveCardToColumn(card, c.id);
            dropdown.remove();
        });
        dropdown.appendChild(opt);
    });
    document.body.appendChild(dropdown);
    setTimeout(() => {
        document.addEventListener('click', function handleOutsideClick(event) {
            if (!dropdown.contains(event.target) && event.target !== icon) {
                dropdown.remove();
                document.removeEventListener('click', handleOutsideClick);
            }
        });
    }, 0);
}

/**
 * Moves the card to the target column.
 * @param {HTMLElement} card - The card element.
 * @param {string} columnId - The target column ID.
 */
function moveCardToColumn(card, columnId) {
    const target = document.getElementById(columnId);
    if (target) {
        const placeholder = target.querySelector('.board-task-element');
        if (placeholder) placeholder.remove();
        target.appendChild(card);
    } else {
        console.error('Target column not found:', columnId);
    }
}

/**
 * Creates the main card container.
 * @param {Object} task - The task object.
 * @returns {HTMLElement} The card container.
 */
function createMainCard(task) {
    const card = document.createElement('div');
    card.classList.add('card-body');
    card.id = 'card-' + task.firebaseId;
    card.draggable = true;
    return card;
}

/**
 * Creates the category and icon container.
 * @param {HTMLElement} card - The parent card element.
 * @returns {HTMLElement} The category-and-icon container.
 */
function createCategoryAndIcon(card) {
    const container = document.createElement('div');
    container.classList.add('category-and-icon');
    const cat = document.createElement('div');
    cat.classList.add('category');
    container.appendChild(cat);
    const icon = document.createElement('img');
    icon.src = './assets/img/icons/board/drag_icon_helper.png';
    icon.alt = 'Drag Icon';
    icon.classList.add('drag-n-drop-helper');
    icon.addEventListener('click', e => {
        e.stopPropagation();
        if (document.querySelector('.move-dropdown')) {
            document.querySelector('.move-dropdown').remove();
            return;
        }
        openMoveDropdown(card, icon);
    });
    container.appendChild(icon);
    return container;
}

/**
 * Creates the headline and info container.
 * @param {Object} task - The task object.
 * @returns {HTMLElement} The headline-info container.
 */
function createHeadlineInfo(task) {
    const container = document.createElement('div');
    const headline = document.createElement('h1');
    headline.classList.add('headline');
    headline.textContent = task.title || 'No title';
    const info = document.createElement('span');
    info.classList.add('info');
    info.textContent = task.description || '';
    container.appendChild(headline);
    container.appendChild(info);
    return container;
}

/**
 * Creates the progress container.
 * @returns {HTMLElement} The progress container.
 */
function createProgressContainer() {
    const container = document.createElement('div');
    container.classList.add('progress-and-subtask');
    const bar = document.createElement('div');
    bar.classList.add('progressbar');
    const fill = document.createElement('div');
    fill.classList.add('progressbar-fill');
    bar.appendChild(fill);
    const counter = document.createElement('div');
    counter.classList.add('subtask-counter');
    counter.textContent = '0/0 subtasks';
    container.appendChild(bar);
    container.appendChild(counter);
    return container;
}

/**
 * Creates the chips and priority container.
 * @returns {HTMLElement} The chips-and-prio container.
 */
function createChipsAndPrioContainer() {
    const container = document.createElement('div');
    container.classList.add('chips-and-prio');
    const chips = document.createElement('div');
    chips.classList.add('chips');
    const prio = document.createElement('div');
    prio.classList.add('prio');
    container.appendChild(chips);
    container.appendChild(prio);
    return container;
}

/**
 * Creates and returns a draggable task card element.
 * @param {Object} task - The task object.
 * @returns {HTMLElement} The created task card.
 */
export function createTaskCard(task) {
    const card = createMainCard(task);
    card.appendChild(createCategoryAndIcon(card));
    card.appendChild(createHeadlineInfo(task));
    card.appendChild(createProgressContainer());
    card.appendChild(createChipsAndPrioContainer());
    setCategoryBadge(card, task.category);
    setPriorityIcon(card, task.priority);
    setSubtaskProgress(card, task.subtasks || []);
    setAssignedChips(card, task.assignedTo);
    card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.id);
        card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => { card.classList.remove('dragging'); });
    card.addEventListener('click', () => openTaskModal(task));
    return card;
}

/**
 * Updates the task card's progress bar and counter.
 * @param {string} firebaseId - The task's Firebase ID.
 * @param {Array} newSubtasks - The updated subtasks array.
 */
export function updateCardProgress(firebaseId, newSubtasks) {
    const card = document.getElementById('card-' + firebaseId);
    if (!card) return;
    setSubtaskProgress(card, newSubtasks);
}
