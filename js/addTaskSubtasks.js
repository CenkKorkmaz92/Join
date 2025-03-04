/**
 * addTaskSubtasks.js
 * Manages subtask creation, editing, and deletion in the UI.
 */

export function initSubtaskEvents() {
    const inputField = document.getElementById('subtask-input');
    const confirmButton = document.getElementById('confirm-subtask');
    const addButton = document.getElementById('add-subtask-btn');
    const clearButton = document.getElementById('clear-subtask');

    inputField.addEventListener('input', () => toggleButtons(Boolean(inputField.value.trim())));
    confirmButton.addEventListener('click', () => addSubtask());
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSubtask();
    });
    clearButton.addEventListener('click', () => clearInput());
    addButton.classList.remove('hidden');
}

function toggleButtons(show) {
    document.getElementById('add-subtask-btn').classList.toggle('hidden', show);
    document.getElementById('confirm-subtask').classList.toggle('hidden', !show);
    document.getElementById('clear-subtask').classList.toggle('hidden', !show);
    document.getElementById('vector').classList.toggle('hidden', !show);
}

function clearInput() {
    const inputField = document.getElementById('subtask-input');
    inputField.value = '';
    toggleButtons(false);
}

/**
 * Creates a new subtask list item and appends it.
 */
export function addSubtask() {
    const input = document.getElementById('subtask-input');
    const text = input.value.trim();
    if (!text) return;

    const li = document.createElement('li');
    li.classList.add('subtask-item');
    li.innerHTML = subtaskItemHTML(text);
    document.getElementById('subtask-list').appendChild(li);

    const subtaskSpan = li.querySelector('.subtask-text');
    const editIcon = li.querySelector('.edit-subtask');
    const deleteIcon = li.querySelector('.delete-subtask');

    editIcon.addEventListener('click', () => handleInlineEdit(subtaskSpan));
    subtaskSpan.addEventListener('dblclick', () => handleInlineEdit(subtaskSpan));
    deleteIcon.addEventListener('click', () => li.remove());

    input.value = '';
    toggleButtons(false);
}

function subtaskItemHTML(text) {
    return `
      <div class="subtask-item-container">
        <span class="subtask-text">• ${text}</span>
        <div class="subtask-li-icons-container">
          <img src="./assets/img/icons/addTask/edit_icon.svg" alt="Edit" class="edit-subtask">
          <div>|</div>
          <img src="./assets/img/icons/addTask/delete_icon.svg" alt="Delete" class="delete-subtask">
        </div>
      </div>
    `;
}

/**
 * Switches a subtask into inline edit mode.
 */
function handleInlineEdit(subtaskSpan) {
    const originalText = subtaskSpan.textContent.replace(/^•\s*/, '');
    const container = subtaskSpan.closest('.subtask-item-container');
    container.innerHTML = editModeHTML(originalText);

    const editInput = container.querySelector('.subtask-edit-input');
    const cancelBtn = container.querySelector('.cancel-edit');
    const confirmBtn = container.querySelector('.confirm-edit');

    editInput.focus();
    cancelBtn.addEventListener('click', () => restoreView(container, originalText));
    confirmBtn.addEventListener('click', () => {
        const newText = editInput.value.trim() || originalText;
        restoreView(container, newText);
    });
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmBtn.click();
        if (e.key === 'Escape') cancelBtn.click();
    });
}

function editModeHTML(orig) {
    return `
      <div class="input-subtask-wrapper editing-subtask">
        <input type="text" class="subtask-edit-input" value="${orig}" />
        <div class="subtask-buttons">
          <button class="cancel-edit">
            <img src="./assets/img/icons/addTask/delete_icon.svg" alt="Cancel Edit">
          </button>
          <button class="confirm-edit">
            <img src="./assets/img/icons/addTask/check_Subtasks_icon.svg" alt="Confirm Edit">
          </button>
        </div>
      </div>
    `;
}

function restoreView(container, text) {
    container.innerHTML = subtaskItemHTML(text).trim();
    const newSpan = container.querySelector('.subtask-text');
    const editIcon = container.querySelector('.edit-subtask');
    const deleteIcon = container.querySelector('.delete-subtask');
    editIcon.addEventListener('click', () => handleInlineEdit(newSpan));
    newSpan.addEventListener('dblclick', () => handleInlineEdit(newSpan));
    deleteIcon.addEventListener('click', () => container.parentNode.remove());
}
