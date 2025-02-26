/**
 * @file board.js
 * @description A Kanban board that:
 *  - Loads tasks from Firebase
 *  - Creates drag-and-drop cards
 *  - Shows a "big card" modal in view mode
 *  - Lets the user delete tasks
 *  - Lets the user enter a simple "edit mode" with a hidden form
 *  - Updates tasks in Firebase
 *  - Has placeholders for empty columns
 */

// ------------------
// Global Variables
// ------------------
let currentTask = null;     // The task currently shown in the modal
let originColumnId = null;  // For drag-and-drop
let isEditing = false;      // Whether the modal is in edit mode

// ------------------
// Load & Render
// ------------------
function loadTasks() {
  const FIREBASE_TASKS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

  // Clear existing columns
  document.querySelectorAll('.board-list-column').forEach((column) => {
    column.innerHTML = '';
  });

  fetch(FIREBASE_TASKS_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        console.log('No tasks found');
        addPlaceholdersToEmptyColumns();
        return;
      }

      // Convert the Firebase object into an array
      const tasks = Object.entries(data).map(([firebaseId, task]) => ({
        firebaseId,
        ...task,
      }));

      // Fix subtask format if needed, then render each task card
      tasks.forEach((task) => {
        fixSubtaskFormat(task);
        task.status = task.status || 'toDo';
        createTaskCard(task);
      });

      addPlaceholdersToEmptyColumns();
    })
    .catch((error) => console.error('Error fetching tasks:', error));
}

/**
 * If subtasks are strings, convert them to { text, done: false } objects.
 */
function fixSubtaskFormat(task) {
  const subs = task.subtasks;
  if (!subs || !Array.isArray(subs)) return;

  if (typeof subs[0] === 'string') {
    console.log(`Converting string subtasks for task ${task.firebaseId}`);
    const newSubtasks = subs.map((s) => ({ text: s, done: false }));
    task.subtasks = newSubtasks;
    patchSubtasks(task.firebaseId, newSubtasks);
  }
}

/**
 * PATCH the updated subtasks array to Firebase.
 */
function patchSubtasks(firebaseId, newSubtasks) {
  const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
  fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtasks: newSubtasks }),
  })
    .then((res) => res.json())
    .then(() => {
      console.log(`Subtasks patched for task: ${firebaseId}`);
    })
    .catch((error) => console.error('Error patching subtasks:', error));
}

/**
 * Creates a draggable card and appends it to the correct column.
 */
function createTaskCard(task) {
  const template = document.getElementById('cardTemplate');
  const cardClone = template.content.firstElementChild.cloneNode(true);
  cardClone.id = 'card-' + task.firebaseId;
  cardClone.draggable = true;

  // Drag start
  cardClone.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', cardClone.id);
    originColumnId = cardClone.parentNode.id;
    cardClone.classList.add('dragging');
  });
  // Drag end
  cardClone.addEventListener('dragend', () => {
    cardClone.classList.remove('dragging');
  });

  // Clicking the card -> open the big card modal
  cardClone.addEventListener('click', () => {
    openTaskModal(task);
  });

  // Category
  const categoryEl = cardClone.querySelector('.category');
  if (task.category === 'user-story') {
    categoryEl.classList.add('category-user');
    categoryEl.textContent = 'User Story';
  } else if (task.category === 'technical-task') {
    categoryEl.classList.add('category-technical');
    categoryEl.textContent = 'Technical Task';
  } else {
    categoryEl.textContent = task.category || 'No category';
  }

  // Title & Description
  cardClone.querySelector('.headline').textContent = task.title || 'No title';
  cardClone.querySelector('.info').textContent = task.description || '';

  // Subtasks & progress
  const progressEl = cardClone.querySelector('.progress-and-subtask');
  const total = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
  if (total === 0) {
    progressEl.style.display = 'none';
  } else {
    progressEl.style.display = 'flex';
    const completed = task.subtasks.filter((s) => s.done).length;
    const fillPercent = (completed / total) * 100;
    cardClone.querySelector('.subtask-counter').textContent =
      `${completed}/${total} subtasks`;
    cardClone.querySelector('.progressbar-fill').style.width =
      fillPercent + '%';
  }

  // Priority icon
  const prioEl = cardClone.querySelector('.prio');
  prioEl.innerHTML = '';
  if (task.priority === 'urgent') {
    prioEl.innerHTML = `<img src="./assets/img/icons/addTask/arrow_up_icon.svg" alt="Urgent" />`;
  } else if (task.priority === 'medium') {
    prioEl.innerHTML = `<img src="./assets/img/icons/addTask/equal_icon.svg" alt="Medium" />`;
  } else if (task.priority === 'low') {
    prioEl.innerHTML = `<img src="./assets/img/icons/addTask/arrow_down_icon.svg" alt="Low" />`;
  } else {
    prioEl.textContent = task.priority || 'none';
  }

  // Assigned contacts (chips)
  const chipsContainer = cardClone.querySelector('.chips');
  chipsContainer.innerHTML = '';
  if (task.assignedTo && task.assignedTo.length > 0) {
    task.assignedTo.forEach((contact) => {
      const chip = document.createElement('div');
      chip.classList.add('contact-chip');
      chip.style.backgroundColor = contact.color || '#999';
      chip.textContent = contact.initials || '?';
      chipsContainer.appendChild(chip);
    });
  }

  // Append to correct column
  const columnId = task.status || 'toDo';
  const column = document.getElementById(columnId);
  if (column) {
    const placeholder = column.querySelector('.board-task-element');
    if (placeholder) {
      placeholder.remove();
    }
    column.appendChild(cardClone);
  } else {
    console.error(`Column with id '${columnId}' not found.`);
  }
}

/**
 * Opens the big card modal in "view mode."
 */
function openTaskModal(task) {
  // Exit any edit mode if needed
  isEditing = false;
  currentTask = task;

  // Show the "view mode" container, hide the "edit mode" container
  document.getElementById('viewModeContainer').style.display = 'block';
  document.getElementById('editFormContainer').style.display = 'none';

  // Populate the view-mode fields
  const categoryBadge = document.getElementById('taskCategoryBadge');
  categoryBadge.classList.remove('category-user', 'category-technical');
  if (task.category === 'user-story') {
    categoryBadge.classList.add('category-user');
    categoryBadge.textContent = 'User Story';
  } else if (task.category === 'technical-task') {
    categoryBadge.classList.add('category-technical');
    categoryBadge.textContent = 'Technical Task';
  } else {
    categoryBadge.textContent = task.category || 'No category';
  }

  document.getElementById('taskTitle').textContent = task.title || 'No title';
  document.getElementById('taskDescription').textContent =
    task.description || 'No description';
  document.getElementById('taskDueDate').textContent =
    task.dueDate || 'No date set';

  const taskPrioritySpan = document.getElementById('taskPriority');
  taskPrioritySpan.innerHTML = '';
  if (task.priority === 'urgent') {
    taskPrioritySpan.innerHTML = `Urgent <img src="./assets/img/icons/addTask/arrow_up_icon.svg" alt="Urgent" />`;
  } else if (task.priority === 'medium') {
    taskPrioritySpan.innerHTML = `Medium <img src="./assets/img/icons/addTask/equal_icon.svg" alt="Medium" />`;
  } else if (task.priority === 'low') {
    taskPrioritySpan.innerHTML = `Low <img src="./assets/img/icons/addTask/arrow_down_icon.svg" alt="Low" />`;
  } else {
    taskPrioritySpan.textContent = task.priority || 'none';
  }

  // Assigned
  const assignedEl = document.getElementById('taskAssignedTo');
  assignedEl.innerHTML = '';
  if (task.assignedTo && task.assignedTo.length > 0) {
    task.assignedTo.forEach((person) => {
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
  } else {
    const li = document.createElement('li');
    li.textContent = 'None';
    assignedEl.appendChild(li);
  }

  // Subtasks
  const subtasksList = document.getElementById('taskSubtasks');
  subtasksList.innerHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((sub, index) => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!sub.done;
      checkbox.addEventListener('change', () => {
        toggleSubtaskDone(task, index, checkbox.checked);
      });
      const label = document.createElement('label');
      label.textContent = sub.text;
      li.appendChild(checkbox);
      li.appendChild(label);
      subtasksList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No subtasks';
    subtasksList.appendChild(li);
  }

  // Show the modal
  openModal('viewTaskModal');
}

/**
 * Toggles a subtask's 'done' status and updates Firebase.
 */
function toggleSubtaskDone(task, subtaskIndex, isDone) {
  task.subtasks[subtaskIndex].done = isDone;
  const updatedSubtasks = task.subtasks.map((s) => ({
    text: s.text,
    done: s.done,
  }));
  const firebaseId = task.firebaseId;
  const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
  fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtasks: updatedSubtasks }),
  })
    .then((res) => res.json())
    .then(() => {
      updateCardProgress(firebaseId, updatedSubtasks);
    })
    .catch((error) => console.error('Error updating subtask done status:', error));
}

/**
 * Updates the small card's progress bar & counter.
 */
function updateCardProgress(firebaseId, newSubtasks) {
  const cardId = 'card-' + firebaseId;
  const card = document.getElementById(cardId);
  if (!card) return;

  const progressEl = card.querySelector('.progress-and-subtask');
  const total = newSubtasks.length;
  if (total === 0) {
    progressEl.style.display = 'none';
    return;
  }
  progressEl.style.display = 'flex';
  const completed = newSubtasks.filter((s) => s.done).length;
  const fillPercent = (completed / total) * 100;
  card.querySelector('.subtask-counter').textContent =
    `${completed}/${total} subtasks`;
  card.querySelector('.progressbar-fill').style.width = fillPercent + '%';
}

/**
 * Updates a task's status (column) in Firebase.
 */
function updateTaskStatusInFirebase(cardId, newStatus) {
  const firebaseId = cardId.replace('card-', '');
  const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
  fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((res) => res.json())
    .then((data) => console.log('Task status updated:', data))
    .catch((error) => console.error('Error updating task status:', error));
}

/**
 * Adds a new task to Firebase and reloads the board.
 */
function addTask(newTaskData) {
  fetch(
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTaskData),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log('Task created:', data);
      loadTasks();
    })
    .catch((error) => console.error('Error creating task:', error));
}

/**
 * Deletes a task from Firebase, closes the modal, and refreshes.
 */
function deleteTask(firebaseId) {
  const deleteUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
  fetch(deleteUrl, { method: 'DELETE' })
    .then((response) => response.json())
    .then(() => {
      console.log(`Task ${firebaseId} deleted successfully`);
      closeModal('viewTaskModal');
      loadTasks();
    })
    .catch((error) => console.error('Error deleting task:', error));
}

// ---------------------
// Edit Mode Functions
// ---------------------
function enterEditMode() {
  isEditing = true;
  // Hide view container, show edit form
  document.getElementById('viewModeContainer').style.display = 'none';
  document.getElementById('editFormContainer').style.display = 'block';

  // Populate the edit form fields from currentTask
  document.getElementById('editTitleInput').value = currentTask.title || '';
  document.getElementById('editDescriptionInput').value =
    currentTask.description || '';
  document.getElementById('editDueDateInput').value =
    currentTask.dueDate && currentTask.dueDate !== 'No date set'
      ? currentTask.dueDate
      : '';

  // Priority
  const currentPrio = currentTask.priority || 'medium';
  document.getElementById('editPriorityInput').value = currentPrio;
  highlightPriorityButton(currentPrio);

  // (Optional) handle assignedTo, subtasks, etc. here
}

function dismissEditMode() {
  isEditing = false;
  // Hide edit form, show view mode again
  document.getElementById('editFormContainer').style.display = 'none';
  document.getElementById('viewModeContainer').style.display = 'block';
  // Reopen the modal in normal view mode
  openTaskModal(currentTask);
}

function saveEditMode() {
  const updatedTask = { ...currentTask };
  updatedTask.title = document.getElementById('editTitleInput').value;
  updatedTask.description = document.getElementById('editDescriptionInput').value;
  updatedTask.dueDate =
    document.getElementById('editDueDateInput').value || 'No date set';
  updatedTask.priority =
    document.getElementById('editPriorityInput').value || 'medium';

  // If you handle assigned contacts or subtasks, gather them here as well

  const firebaseId = updatedTask.firebaseId;
  const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
  fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  })
    .then((res) => res.json())
    .then(() => {
      console.log(`Task ${firebaseId} updated successfully`);
      currentTask = updatedTask;
      isEditing = false;
      // Switch back to view mode
      document.getElementById('editFormContainer').style.display = 'none';
      document.getElementById('viewModeContainer').style.display = 'block';
      // Reload the modal with updated data
      openTaskModal(updatedTask);
      // Refresh board so card updates
      loadTasks();
    })
    .catch((error) => console.error('Error updating task:', error));
}

/**
 * Simple function to highlight the correct priority button.
 * (If you have "active" styling, etc.)
 */
function highlightPriorityButton(priority) {
  document.getElementById('prioUrgentBtn').classList.remove('active');
  document.getElementById('prioMediumBtn').classList.remove('active');
  document.getElementById('prioLowBtn').classList.remove('active');

  if (priority === 'urgent') {
    document.getElementById('prioUrgentBtn').classList.add('active');
  } else if (priority === 'medium') {
    document.getElementById('prioMediumBtn').classList.add('active');
  } else if (priority === 'low') {
    document.getElementById('prioLowBtn').classList.add('active');
  }
}

// ---------------------
// Placeholders
// ---------------------
function addPlaceholderIfEmpty(column) {
  const placeholderDiv = document.createElement('div');
  placeholderDiv.classList.add('board-task-element');
  placeholderDiv.style.textAlign = 'center';
  placeholderDiv.style.padding = '20px';

  let placeholderText = '';
  if (column.id === 'toDo') {
    placeholderText = 'No tasks To do';
  } else if (column.id === 'inProgress') {
    placeholderText = 'No tasks In Progress';
  } else if (column.id === 'awaitFeedback') {
    placeholderText = 'No tasks Awaiting Feedback';
  } else if (column.id === 'done') {
    placeholderText = 'No tasks Done';
  } else {
    placeholderText = 'No tasks';
  }
  placeholderDiv.textContent = placeholderText;
  column.appendChild(placeholderDiv);
}

function addPlaceholdersToEmptyColumns() {
  document.querySelectorAll('.board-list-column').forEach((column) => {
    if (column.children.length === 0) {
      addPlaceholderIfEmpty(column);
    }
  });
}

// ---------------------
// DOM Initialization
// ---------------------
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();

  // Setup drag & drop
  const columns = document.querySelectorAll('.board-list-column');
  columns.forEach((column) => {
    column.addEventListener('dragover', (event) => event.preventDefault());
    column.addEventListener('dragenter', (event) => {
      event.preventDefault();
      column.classList.add('hovered');
    });
    column.addEventListener('dragleave', (event) => {
      event.preventDefault();
      column.classList.remove('hovered');
    });
    column.addEventListener('drop', (event) => {
      event.preventDefault();
      column.classList.remove('hovered');
      const cardId = event.dataTransfer.getData('text/plain');
      const card = document.getElementById(cardId);
      if (card) {
        const placeholder = column.querySelector('.board-task-element');
        if (placeholder) {
          placeholder.remove();
        }
        column.appendChild(card);
        if (originColumnId && originColumnId !== column.id) {
          const oldColumn = document.getElementById(originColumnId);
          if (oldColumn) {
            const cardsLeft = oldColumn.querySelectorAll('.card-body').length;
            if (cardsLeft === 0) {
              addPlaceholderIfEmpty(oldColumn);
            }
          }
        }
        updateTaskStatusInFirebase(cardId, column.id);
      }
    });
  });

  // Priority button listeners in the edit form
  const prioUrgentBtn = document.getElementById('prioUrgentBtn');
  const prioMediumBtn = document.getElementById('prioMediumBtn');
  const prioLowBtn = document.getElementById('prioLowBtn');
  if (prioUrgentBtn) {
    prioUrgentBtn.addEventListener('click', () => {
      document.getElementById('editPriorityInput').value = 'urgent';
      highlightPriorityButton('urgent');
    });
  }
  if (prioMediumBtn) {
    prioMediumBtn.addEventListener('click', () => {
      document.getElementById('editPriorityInput').value = 'medium';
      highlightPriorityButton('medium');
    });
  }
  if (prioLowBtn) {
    prioLowBtn.addEventListener('click', () => {
      document.getElementById('editPriorityInput').value = 'low';
      highlightPriorityButton('low');
    });
  }

  // Edit form buttons: "Dismiss" and "Ok"
  const dismissEditBtn = document.getElementById('dismissEditBtn');
  if (dismissEditBtn) {
    dismissEditBtn.addEventListener('click', dismissEditMode);
  }
  const saveEditBtn = document.getElementById('saveEditBtn');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveEditMode);
  }

  // View mode buttons: "Edit" and "Delete"
  const editButton = document.getElementById('editTaskBtn');
  if (editButton) {
    editButton.addEventListener('click', () => {
      enterEditMode();
    });
  }
  const deleteButton = document.getElementById('deleteTaskBtn');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      // Only delete if not in edit mode; if in edit mode, user has a separate "Dismiss" button
      if (currentTask && currentTask.firebaseId && !isEditing) {
        deleteTask(currentTask.firebaseId);
      }
    });
  }
});
