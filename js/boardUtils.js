/**
 * boardUtils.js
 * Generic utility functions, e.g., open/close modal, placeholders, etc.
 */

export function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

export function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

/**
 * Adds a placeholder element to an empty column.
 */
export function addPlaceholderIfEmpty(column) {
    const placeholder = document.createElement('div');
    placeholder.classList.add('board-task-element');
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '20px';

    let text = 'No tasks';
    if (column.id === 'toDo') text = 'No tasks To do';
    if (column.id === 'inProgress') text = 'No tasks In Progress';
    if (column.id === 'awaitFeedback') text = 'No tasks Awaiting Feedback';
    if (column.id === 'done') text = 'No tasks Done';
    placeholder.textContent = text;

    column.appendChild(placeholder);
}

/**
 * Check all columns, add placeholders if they are empty.
 */
export function addPlaceholdersToEmptyColumns() {
    document.querySelectorAll('.board-list-column').forEach((col) => {
        if (col.children.length === 0) {
            addPlaceholderIfEmpty(col);
        }
    });
}
