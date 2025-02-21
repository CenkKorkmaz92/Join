/**
 * @file board.js
 * @description Manages fetching tasks from Firebase, rendering them on a Kanban board,
 * implementing drag-and-drop functionality, updating task statuses in Firebase,
 * and showing a larger "detail view" modal when a card is clicked.
 */

// Keep track of the column from which a card is dragged
let originColumnId = null;

/**
 * Loads tasks from Firebase and renders them on the board.
 * Adds a placeholder to any column that remains empty.
 */
function loadTasks() {
  const FIREBASE_TASKS_URL =
    "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  // Clear all columns
  document.querySelectorAll(".board-list-column").forEach((column) => {
    column.innerHTML = "";
  });

  fetch(FIREBASE_TASKS_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        console.log("No tasks found");
        addPlaceholdersToEmptyColumns();
        return;
      }

      // Convert the object from Firebase into an array of task objects
      const tasks = Object.entries(data).map(([firebaseId, task]) => ({
        firebaseId,
        ...task,
      }));

      // Create each task card
      tasks.forEach((task) => {
        task.status = task.status || "toDo";
        createTaskCard(task);
      });

      addPlaceholdersToEmptyColumns();
    })
    .catch((error) => console.error("Error fetching tasks:", error));
}

/**
 * Creates a task card element and appends it to the appropriate board column.
 * Applies a CSS class based on the task's category.
 * Adds a click event to open a detail view modal.
 * @param {Object} task - The task data.
 */
function createTaskCard(task) {
  const template = document.getElementById("cardTemplate");
  const cardClone = template.content.firstElementChild.cloneNode(true);

  // Give the clone a unique ID and make it draggable
  cardClone.id = "card-" + task.firebaseId;
  cardClone.draggable = true;

  // DRAG EVENTS
  cardClone.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", cardClone.id);
    originColumnId = cardClone.parentNode.id;
    cardClone.classList.add("dragging");
  });
  cardClone.addEventListener("dragend", () => {
    cardClone.classList.remove("dragging");
  });

  // CLICK EVENT: Open the big card modal
  cardClone.addEventListener("click", () => {
    openTaskModal(task);
  });

  // CATEGORY
  const categoryEl = cardClone.querySelector(".category");
  if (task.category === "user-story") {
    categoryEl.classList.add("category-user");
    categoryEl.textContent = "User Story";
  } else if (task.category === "technical-task") {
    categoryEl.classList.add("category-technical");
    categoryEl.textContent = "Technical Task";
  } else {
    categoryEl.textContent = task.category || "No category";
  }

  // TITLE & DESCRIPTION
  cardClone.querySelector(".headline").textContent = task.title || "No title";
  cardClone.querySelector(".info").textContent = task.description || "";

  // SUBTASKS & PROGRESS (placeholder logic for completed subtasks)
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = 0; // update this if/when you add tracking
  const fillPercent =
    totalSubtasks === 0 ? 100 : (completedSubtasks / totalSubtasks) * 100;

  const subtaskCounterEl = cardClone.querySelector(".subtask-counter");
  if (subtaskCounterEl) {
    subtaskCounterEl.textContent = `${completedSubtasks}/${totalSubtasks} subtasks`;
  }

  const progressFillEl = cardClone.querySelector(".progressbar-fill");
  if (progressFillEl) {
    progressFillEl.style.width = fillPercent + "%";
  }

  // PRIORITY
  cardClone.querySelector(".prio").textContent = task.priority || "none";

  // ASSIGNED TO
  if (task.assignedTo && task.assignedTo.length > 0) {
    cardClone.querySelector(".chips").textContent = task.assignedTo
      .map((c) => c.initials || c.fullName || "??")
      .join(", ");
  } else {
    cardClone.querySelector(".chips").textContent = "";
  }

  // Append to the correct column
  const columnId = task.status || "toDo";
  const column = document.getElementById(columnId);
  if (column) {
    const placeholder = column.querySelector(".board-task-element");
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
 * @param {Object} task - The task data.
 */
function openTaskModal(task) {
  // CATEGORY BADGE
  const categoryBadge = document.getElementById("taskCategoryBadge");
  categoryBadge.classList.remove("category-user", "category-technical");

  if (task.category === "user-story") {
    categoryBadge.classList.add("category-user");
    categoryBadge.textContent = "User Story";
  } else if (task.category === "technical-task") {
    categoryBadge.classList.add("category-technical");
    categoryBadge.textContent = "Technical Task";
  } else {
    categoryBadge.textContent = task.category || "No category";
  }

  // TITLE & DESCRIPTION
  document.getElementById("taskTitle").textContent = task.title || "No title";
  document.getElementById("taskDescription").textContent =
    task.description || "No description";

  // DUE DATE
  document.getElementById("taskDueDate").textContent =
    task.dueDate || "No date set";

  // PRIORITY
  document.getElementById("taskPriority").textContent = task.priority || "none";

  // ASSIGNED TO
  const assignedEl = document.getElementById("taskAssignedTo");
  assignedEl.innerHTML = "";
  if (task.assignedTo && task.assignedTo.length > 0) {
    task.assignedTo.forEach((person) => {
      const li = document.createElement("li");

      // Example: Add avatar or initials
      const initialsDiv = document.createElement("div");
      initialsDiv.classList.add("avatar");
      initialsDiv.textContent = person.initials || "??";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = person.fullName || "No Name";

      li.appendChild(initialsDiv);
      li.appendChild(nameSpan);
      assignedEl.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "None";
    assignedEl.appendChild(li);
  }

  // SUBTASKS
  const subtasksList = document.getElementById("taskSubtasks");
  subtasksList.innerHTML = "";
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((sub) => {
      const li = document.createElement("li");
      li.textContent = sub;
      subtasksList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No subtasks";
    subtasksList.appendChild(li);
  }

  // Now actually open the modal (provided by modal.js)
  openModal("viewTaskModal");
}

/**
 * Closes the task detail modal (if you ever need to call this from board.js).
 */
function closeTaskModal() {
  closeModal("viewTaskModal");
}

/**
 * Updates the task's status in Firebase.
 * @param {string} cardId - The card element's ID ("card-<firebaseId>").
 * @param {string} newStatus - The new status (column id).
 */
function updateTaskStatusInFirebase(cardId, newStatus) {
  const firebaseId = cardId.replace("card-", "");
  const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;

  fetch(updateUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((res) => res.json())
    .then((data) => console.log("Task status updated:", data))
    .catch((error) => console.error("Error updating task status:", error));
}

/**
 * Adds a new task to Firebase and refreshes the board.
 * @param {Object} newTaskData - The new task data.
 */
function addTask(newTaskData) {
  fetch(
    "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTaskData),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("Task created:", data);
      loadTasks();
    })
    .catch((error) => console.error("Error creating task:", error));
}

/**
 * Creates and appends a placeholder element to the specified column.
 * @param {HTMLElement} column - The column element.
 */
function addPlaceholderIfEmpty(column) {
  const placeholderDiv = document.createElement("div");
  placeholderDiv.classList.add("board-task-element");

  let placeholderText = "";
  if (column.id === "toDo") {
    placeholderText = "No tasks To do";
  } else if (column.id === "inProgress") {
    placeholderText = "No tasks In Progress";
  } else if (column.id === "awaitFeedback") {
    placeholderText = "No tasks Awaiting Feedback";
  } else if (column.id === "done") {
    placeholderText = "No tasks Done";
  } else {
    placeholderText = "No tasks";
  }

  placeholderDiv.textContent = placeholderText;
  column.appendChild(placeholderDiv);
}

/**
 * Iterates through all board columns and adds a placeholder if the column is empty.
 */
function addPlaceholdersToEmptyColumns() {
  document.querySelectorAll(".board-list-column").forEach((column) => {
    if (column.children.length === 0) {
      addPlaceholderIfEmpty(column);
    }
  });
}

/**
 * Initializes the board once the DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();

  // DRAG & DROP LISTENERS
  const columns = document.querySelectorAll(".board-list-column");
  columns.forEach((column) => {
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("dragenter", (event) => {
      event.preventDefault();
      column.classList.add("hovered");
    });
    column.addEventListener("dragleave", (event) => {
      event.preventDefault();
      column.classList.remove("hovered");
    });
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("hovered");

      const cardId = event.dataTransfer.getData("text/plain");
      const card = document.getElementById(cardId);

      if (card) {
        // Remove "No tasks" placeholder if present
        const placeholder = column.querySelector(".board-task-element");
        if (placeholder) {
          placeholder.remove();
        }

        // Append the dragged card to the new column
        column.appendChild(card);

        // If the old column is now empty, restore placeholder
        if (originColumnId && originColumnId !== column.id) {
          const oldColumn = document.getElementById(originColumnId);
          if (oldColumn) {
            const cardsLeft = oldColumn.querySelectorAll(".card-body").length;
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
});
