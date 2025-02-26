/**
 * @file board.js
 * @description Manages:
 *  - fetching tasks from Firebase,
 *  - converting string subtasks to { text, done } objects,
 *  - rendering them on a Kanban board with drag-and-drop,
 *  - contact chips & priority icons,
 *  - subtask progress bars,
 *  - opening a "detail view" modal with checkbox toggles,
 *  - updating tasks in Firebase,
 *  - deleting tasks.
 */

// Global variable to hold the current task shown in the modal
let currentTask = null;
let originColumnId = null;

/**
 * Loads tasks from Firebase and renders them on the board.
 * Also auto-converts subtask arrays of strings into objects.
 * Adds a placeholder if columns are empty.
 */
function loadTasks() {
  const FIREBASE_TASKS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

  // Clear all columns first
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

      // Convert Firebase object to an array of tasks
      const tasks = Object.entries(data).map(([firebaseId, task]) => ({
        firebaseId,
        ...task,
      }));

      // For each task, convert string subtasks -> { text, done } objects if needed
      tasks.forEach((task) => {
        fixSubtaskFormat(task); // auto-convert if needed
        task.status = task.status || 'toDo';
        createTaskCard(task);
      });

      addPlaceholdersToEmptyColumns();
    })
    .catch((error) => console.error('Error fetching tasks:', error));
}

/**
 * If the task's subtasks are an array of strings, convert them to
 * an array of { text, done } objects, then PATCH back to Firebase.
 *
 * @param {Object} task - The task object from Firebase (with .firebaseId).
 */
function fixSubtaskFormat(task) {
  const subs = task.subtasks;
  if (!subs || !Array.isArray(subs)) return; // No subtasks or not an array

  // Check if the first element is a string => assume all are strings
  if (typeof subs[0] === 'string') {
    console.log(`Converting string subtasks for task ${task.firebaseId}`);

    // Convert each string -> { text, done: false }
    const newSubtasks = subs.map((s) => ({
      text: s,
      done: false,
    }));

    // Update the local task object
    task.subtasks = newSubtasks;

    // Patch back to Firebase so subsequent loads are already objects
    patchSubtasks(task.firebaseId, newSubtasks);
  }
}

/**
 * Sends a PATCH request to update a task's 'subtasks' array in Firebase.
 * @param {string} firebaseId - The unique ID of the task in Firebase.
 * @param {Array} newSubtasks - The updated array of { text, done } objects.
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
 * Creates a task card element and appends it to the correct board column.
 * Shows colored chips for assigned contacts and an icon for priority.
 * @param {Object} task - The task data from Firebase (including .firebaseId).
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
    // If no subtasks, hide the progress bar + counter entirely
    progressAndSubtaskEl.style.display = 'none';
  } else {
    // Show the progress bar + counter
    progressAndSubtaskEl.style.display = 'flex';

    // Count how many subtasks are done
    const completedSubtasks = task.subtasks.filter((s) => s.done).length;
    const fillPercent = (completedSubtasks / totalSubtasks) * 100;

    const subtaskCounterEl = cardClone.querySelector('.subtask-counter');
    subtaskCounterEl.textContent = `${completedSubtasks}/${totalSubtasks} subtasks`;

    const progressFillEl = cardClone.querySelector('.progressbar-fill');
    progressFillEl.style.width = fillPercent + '%';
  }

  // PRIORITY ICON (SMALL CARD ONLY)
  const prioEl = cardClone.querySelector('.prio');
  prioEl.innerHTML = ''; // Clear any text
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
      // Create a "chip" with background color + initials
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
 * Renders contact avatars in color, plus text+icon for priority.
 */
function openTaskModal(task) {
  // Store current task for later use (e.g., deletion)
  currentTask = task;

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

  // PRIORITY TEXT + ICON (BIG CARD)
  const taskPrioritySpan = document.getElementById('taskPriority');
  taskPrioritySpan.innerHTML = ''; // Clear old content

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

  // SUBTASKS with checkboxes
  const subtasksList = document.getElementById('taskSubtasks');
  subtasksList.innerHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((sub, index) => {
      const li = document.createElement('li');

      // Create a checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!sub.done; // true/false
      checkbox.addEventListener('change', () => {
        // Update this subtask's "done" status in Firebase
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
 * Then it updates the progress bar on the small card in real time.
 * @param {Object} task - The full task object (including firebaseId).
 * @param {number} subtaskIndex - Index of the subtask in task.subtasks.
 * @param {boolean} isDone - The new 'done' state (true/false).
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
 * Hides the bar if there are zero subtasks.
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
 * Make sure 'subtasks' is an array of { text, done } objects if you want checkboxes.
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
      // Close the modal (assuming closeModal is defined elsewhere)
      closeModal('viewTaskModal');
      // Refresh the board tasks
      loadTasks();
    })
    .catch((error) => console.error('Error deleting task:', error));
}

/**
 * Creates and appends a placeholder element to the specified column.
 */
function addPlaceholderIfEmpty(column) {
  const placeholderDiv = document.createElement('div');
  placeholderDiv.classList.add('board-task-element');

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

/**
 * Checks each board column and adds placeholder if it's empty.
 */
function addPlaceholdersToEmptyColumns() {
  document.querySelectorAll('.board-list-column').forEach((column) => {
    if (column.children.length === 0) {
      addPlaceholderIfEmpty(column);
    }
  });
}

/** Initialize board on DOM load */
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();

  // Drag & Drop listeners for each column
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
        // Remove "No tasks" placeholder if present
        const placeholder = column.querySelector('.board-task-element');
        if (placeholder) {
          placeholder.remove();
        }

        // Move card to new column
        column.appendChild(card);

        // If old column is now empty, restore placeholder
        if (originColumnId && originColumnId !== column.id) {
          const oldColumn = document.getElementById(originColumnId);
          if (oldColumn) {
            const cardsLeft = oldColumn.querySelectorAll('.card-body').length;
            if (cardsLeft === 0) {
              addPlaceholderIfEmpty(oldColumn);
            }
          }
        }

        // Update status in Firebase
        updateTaskStatusInFirebase(cardId, column.id);
      }
    });
  });

  // Attach event listener to the delete button in the modal (ID updated to match HTML)
  const deleteButton = document.getElementById('deleteTaskBtn');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (currentTask && currentTask.firebaseId) {
        deleteTask(currentTask.firebaseId);
      } else {
        console.error('No current task found to delete.');
      }
    });
  }
});
