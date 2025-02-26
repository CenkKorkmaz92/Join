/**
 * @file board.js
 * @description A Kanban board that:
 *  - Loads contacts from Firebase
 *  - Loads tasks from Firebase
 *  - Shows a big card modal in view mode
 *  - Lets the user delete tasks
 *  - Lets the user enter an "edit mode" with the same assigned-contacts dropdown as Add Task
 *  - Allows subtask editing (add, edit, delete), including "press Enter" to add
 *  - Updates tasks in Firebase
 */

let allContacts = [];       // We'll fetch from your "contacts" API
let currentTask = null;     // The task currently shown in the modal
let originColumnId = null;  // For drag-and-drop
let isEditing = false;      // Whether the modal is in edit mode

// A local array to track which contacts are selected in edit mode (mimicking "Add Task" style)
let editAssignedTo = [];

// ------------------
// 1) Load All Contacts
// ------------------
function loadAllContacts() {
  const FIREBASE_CONTACTS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';
  // Adjust if you have a different endpoint for your contacts

  return fetch(FIREBASE_CONTACTS_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        console.log('No contacts found');
        allContacts = [];
        return;
      }

      // Convert the Firebase object into an array
      allContacts = Object.entries(data).map(([id, contact]) => ({
        ...contact
      }));
      console.log('Contacts loaded:', allContacts);
    })
    .catch((error) => {
      console.error('Error fetching contacts:', error);
      allContacts = [];
    });
}

// ------------------
// 2) Load Tasks
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

  // DRAG EVENTS
  cardClone.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', cardClone.id);
    originColumnId = cardClone.parentNode.id;
    cardClone.classList.add('dragging');
  });
  cardClone.addEventListener('dragend', () => {
    cardClone.classList.remove('dragging');
  });

  // CLICK EVENT -> Show big card modal
  cardClone.addEventListener('click', () => {
    openTaskModal(task);
  });

  // CATEGORY (small badge on the card)
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

  // TITLE & DESCRIPTION
  cardClone.querySelector('.headline').textContent = task.title || 'No title';
  cardClone.querySelector('.info').textContent = task.description || '';

  // SUBTASKS + PROGRESS
  const progressAndSubtaskEl = cardClone.querySelector('.progress-and-subtask');
  const totalSubtasks = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
  if (totalSubtasks === 0) {
    progressAndSubtaskEl.style.display = 'none';
  } else {
    progressAndSubtaskEl.style.display = 'flex';
    const completedSubtasks = task.subtasks.filter((s) => s.done).length;
    const fillPercent = (completedSubtasks / totalSubtasks) * 100;

    const subtaskCounterEl = cardClone.querySelector('.subtask-counter');
    subtaskCounterEl.textContent = `${completedSubtasks}/${totalSubtasks} subtasks`;

    const progressFillEl = cardClone.querySelector('.progressbar-fill');
    progressFillEl.style.width = fillPercent + '%';
  }

  // PRIORITY ICON
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

  // ASSIGNED TO (colored chips)
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

  // Place card into the correct column
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
 * Opens the larger "detail view" modal with data from the given task.
 */
function openTaskModal(task) {
  // Exit any edit mode if needed
  isEditing = false;
  currentTask = task;

  // Show the "view mode" container, hide the "edit mode" container
  document.getElementById('viewModeContainer').style.display = 'block';
  document.getElementById('editFormContainer').style.display = 'none';

  // CATEGORY BADGE
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

  // TITLE & DESCRIPTION
  document.getElementById('taskTitle').textContent = task.title || 'No title';
  document.getElementById('taskDescription').textContent =
    task.description || 'No description';

  // DUE DATE
  document.getElementById('taskDueDate').textContent =
    task.dueDate || 'No date set';

  // PRIORITY TEXT + ICON
  const taskPrioritySpan = document.getElementById('taskPriority');
  taskPrioritySpan.innerHTML = '';
  if (task.priority === 'urgent') {
    taskPrioritySpan.innerHTML = `
      Urgent <img src="./assets/img/icons/addTask/arrow_up_icon.svg" alt="Urgent" />
    `;
  } else if (task.priority === 'medium') {
    taskPrioritySpan.innerHTML = `
      Medium <img src="./assets/img/icons/addTask/equal_icon.svg" alt="Medium" />
    `;
  } else if (task.priority === 'low') {
    taskPrioritySpan.innerHTML = `
      Low <img src="./assets/img/icons/addTask/arrow_down_icon.svg" alt="Low" />
    `;
  } else {
    taskPrioritySpan.textContent = task.priority || 'none';
  }

  // ASSIGNED TO
  const assignedEl = document.getElementById('taskAssignedTo');
  assignedEl.innerHTML = '';
  if (task.assignedTo && task.assignedTo.length > 0) {
    task.assignedTo.forEach((person) => {
      const li = document.createElement('li');

      // Colored avatar
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

  // SUBTASKS
  const subtasksList = document.getElementById('taskSubtasks');
  subtasksList.innerHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((sub, index) => {
      const li = document.createElement('li');

      // Create a checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!sub.done;
      checkbox.addEventListener('change', () => {
        toggleSubtaskDone(task, index, checkbox.checked);
      });

      // Label for the subtask text
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
 * Toggles a single subtask's 'done' status and updates in Firebase.
 */
function toggleSubtaskDone(task, subtaskIndex, isDone) {
  // Update local object
  task.subtasks[subtaskIndex].done = isDone;

  // Build the updated subtasks array
  const updatedSubtasks = task.subtasks.map((s) => ({
    text: s.text,
    done: s.done,
  }));

  // PATCH to Firebase
  const firebaseId = task.firebaseId;
  const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;

  fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subtasks: updatedSubtasks }),
  })
    .then((res) => res.json())
    .then(() => {
      // Update small card's progress
      updateCardProgress(firebaseId, updatedSubtasks);
    })
    .catch((error) =>
      console.error('Error updating subtask done status:', error)
    );
}

/**
 * Updates the small card's progress bar & counter based on updated subtasks.
 */
function updateCardProgress(firebaseId, newSubtasks) {
  const cardId = 'card-' + firebaseId;
  const card = document.getElementById(cardId);
  if (!card) return;

  const progressAndSubtaskEl = card.querySelector('.progress-and-subtask');
  const totalSubtasks = newSubtasks.length;
  if (totalSubtasks === 0) {
    progressAndSubtaskEl.style.display = 'none';
    return;
  }

  progressAndSubtaskEl.style.display = 'flex';

  const completedSubtasks = newSubtasks.filter((s) => s.done).length;
  const fillPercent = (completedSubtasks / totalSubtasks) * 100;

  const subtaskCounterEl = card.querySelector('.subtask-counter');
  if (subtaskCounterEl) {
    subtaskCounterEl.textContent = `${completedSubtasks}/${totalSubtasks} subtasks`;
  }

  const progressFillEl = card.querySelector('.progressbar-fill');
  if (progressFillEl) {
    progressFillEl.style.width = fillPercent + '%';
  }
}

/**
 * Updates the task's status in Firebase (for drag-and-drop column changes).
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
 * Deletes a task from Firebase, closes the modal, and refreshes the board.
 * @param {string} firebaseId - The Firebase ID of the task to delete.
 */
function deleteTask(firebaseId) {
  const deleteUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;

  fetch(deleteUrl, {
    method: 'DELETE',
  })
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

  // Subtasks
  if (!currentTask.subtasks) currentTask.subtasks = [];
  populateEditSubtasksList(currentTask.subtasks);

  // Assigned People - using the "Add Task"-style dropdown
  initEditAssignedDropdown();
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

  // assignedTo from the local array editAssignedTo
  updatedTask.assignedTo = editAssignedTo;

  // Subtasks are already updated in currentTask.subtasks
  updatedTask.subtasks = currentTask.subtasks;

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

function highlightPriorityButton(priority) {
  document.getElementById('prioUrgentBtn').classList.remove('selected');
  document.getElementById('prioMediumBtn').classList.remove('selected');
  document.getElementById('prioLowBtn').classList.remove('selected');

  if (priority === 'urgent') {
    document.getElementById('prioUrgentBtn').classList.add('selected');
  } else if (priority === 'medium') {
    document.getElementById('prioMediumBtn').classList.add('selected');
  } else if (priority === 'low') {
    document.getElementById('prioLowBtn').classList.add('selected');
  }
}

// ---------------------
// Subtask Editing
// ---------------------
function populateEditSubtasksList(subtasks) {
  const list = document.getElementById('editSubtasksList');
  list.innerHTML = '';

  subtasks.forEach((sub, index) => {
    const li = document.createElement('li');
    li.classList.add('edit-subtask-item');

    const span = document.createElement('span');
    span.classList.add('subtask-text');
    span.textContent = sub.text;

    // Icons container
    const iconsDiv = document.createElement('div');
    iconsDiv.classList.add('subtask-item-icons');

    // Edit icon
    const editIcon = document.createElement('img');
    editIcon.src = './assets/img/icons/board/edit.svg';
    editIcon.alt = 'Edit subtask';
    editIcon.classList.add('subtask-edit-icon');
    editIcon.addEventListener('click', () => editSubtask(index));

    // Delete icon
    const deleteIcon = document.createElement('img');
    deleteIcon.src = './assets/img/icons/addTask/delete_icon.svg';
    deleteIcon.alt = 'Delete subtask';
    deleteIcon.classList.add('subtask-delete-icon');
    deleteIcon.addEventListener('click', () => deleteSubtask(index));

    iconsDiv.appendChild(editIcon);
    iconsDiv.appendChild(deleteIcon);

    li.appendChild(span);
    li.appendChild(iconsDiv);
    list.appendChild(li);
  });
}

function editSubtask(index) {
  const oldText = currentTask.subtasks[index].text;
  const newText = prompt('Edit subtask:', oldText);
  if (newText !== null && newText.trim() !== '') {
    currentTask.subtasks[index].text = newText.trim();
    populateEditSubtasksList(currentTask.subtasks);
  }
}

function deleteSubtask(index) {
  currentTask.subtasks.splice(index, 1);
  populateEditSubtasksList(currentTask.subtasks);
}

function addNewSubtaskInEdit() {
  const input = document.getElementById('editSubtaskInput');
  const text = input.value.trim();
  if (text) {
    currentTask.subtasks.push({ text, done: false });
    populateEditSubtasksList(currentTask.subtasks);
    input.value = '';
  }
}

// ---------------------
// "Add Task"-Style Assigned Contacts in Edit
// ---------------------
function initEditAssignedDropdown() {
  // 1) Copy currentTask.assignedTo into the local array
  editAssignedTo = currentTask.assignedTo
    ? JSON.parse(JSON.stringify(currentTask.assignedTo))
    : [];

  // 2) Render the dropdown checkboxes
  renderEditContactsDropdown();

  // 3) Update the chips
  updateEditSelectedContactsContainer();

  // 4) Hide the dropdown by default
  document.getElementById('editContactsDropdownList').classList.add('hidden');
}

function renderEditContactsDropdown() {
  const dropdownList = document.getElementById('editContactsDropdownList');
  dropdownList.innerHTML = '';

  allContacts.forEach((contact) => {
    const contactId = `editContactCheckbox-${contact.email}`;

    // Create a label+checkbox
    const label = document.createElement('label');
    label.setAttribute('for', contactId);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = contactId;
    checkbox.checked = editAssignedTo.some((c) => c.email === contact.email);
    checkbox.addEventListener('change', () => {
      toggleEditContact(contact);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(contact.fullName));
    dropdownList.appendChild(label);
  });
}

function toggleEditContact(contact) {
  const index = editAssignedTo.findIndex((c) => c.email === contact.email);
  if (index === -1) {
    // Add
    editAssignedTo.push({
      fullName: contact.fullName,
      email: contact.email,
      color: contact.color,
      initials: contact.initials,
    });
  } else {
    // Remove
    editAssignedTo.splice(index, 1);
  }
  updateEditSelectedContactsContainer();
}

function updateEditSelectedContactsContainer() {
  const container = document.getElementById('editSelectedContactsContainer');
  container.innerHTML = '';

  editAssignedTo.forEach((contact) => {
    const chip = document.createElement('div');
    chip.classList.add('contact-chip');
    chip.style.backgroundColor = contact.color || '#999';
    chip.textContent = contact.initials || '?';
    container.appendChild(chip);
  });
}

function toggleEditContactsDropdown() {
  const dropdownList = document.getElementById('editContactsDropdownList');
  dropdownList.classList.toggle('hidden');
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
  // 1) Load all contacts, then 2) load tasks
  loadAllContacts().then(() => {
    loadTasks();
  });

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

  // Subtask add button in edit mode
  const editAddSubtaskBtn = document.getElementById('editAddSubtaskBtn');
  if (editAddSubtaskBtn) {
    editAddSubtaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addNewSubtaskInEdit();
    });
  }

  // PRESS ENTER to add subtask in edit mode
  const editSubtaskInput = document.getElementById('editSubtaskInput');
  if (editSubtaskInput) {
    editSubtaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewSubtaskInEdit();
      }
    });
  }

  // Edit form buttons: "Dismiss" and "Save"
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
      // Only delete if not in edit mode
      if (currentTask && currentTask.firebaseId && !isEditing) {
        deleteTask(currentTask.firebaseId);
      }
    });
  }

  // Toggle the assigned-contacts dropdown (like in Add Task)
  const editDropdownToggle = document.getElementById('editDropdownToggle');
  if (editDropdownToggle) {
    editDropdownToggle.addEventListener('click', () => {
      toggleEditContactsDropdown();
    });
  }
});
