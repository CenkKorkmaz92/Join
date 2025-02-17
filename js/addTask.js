// addTask.js
/**
 * Manages the Add Task page: subtask creation, editing, deletion,
 * form clearing, priority/date logic, and enabling/disabling the Create Task button.
 */

// Example JSON data for "Assigned to" (could be fetched from an API).
const FIREBASE_BASE_URL =
  "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts.json"; // Direkt auf die contacts.json zugreifen

const contacts = [
  { name: "John Doe" },
  { name: "Jane Smith" },
  { name: "Alex Johnson" },
  { name: "Emily Davis" }
];

// Populate the <datalist> with these contacts.
const datalist = document.getElementById("assignees");
contacts.forEach(contact => {
  const option = document.createElement("option");
  option.value = contact.name;
  datalist.appendChild(option);
});

document.addEventListener("DOMContentLoaded", () => {
  /** Required field references */
  const titleInput = document.querySelector('input[placeholder="Enter a title"]');
  const dueDateInput = document.querySelector('input[type="date"]');
  const categorySelect = document.getElementById("category");
  const createTaskBtn = document.querySelector(".create-btn");

  /** Subtask references */
  const inputField = document.getElementById("subtask-input");
  const addButton = document.getElementById("add-subtask-btn");
  const clearButton = document.getElementById("clear-subtask");
  const confirmButton = document.getElementById("confirm-subtask");
  const vector = document.getElementById("vector");
  const subtaskList = document.getElementById("subtask-list");
  const bottomClearButton = document.getElementById("clear-all-fields-btn");

  /**
   * Checks if required fields are all filled; enables or disables Create Task button.
   */
  function validateForm() {
    const titleFilled = titleInput.value.trim() !== "";
    const dateFilled = dueDateInput.value !== "";
    const categoryFilled = categorySelect.value !== "";
    createTaskBtn.disabled = !(titleFilled && dateFilled && categoryFilled);
  }

  /**
   * Toggles visibility of the subtask confirm/clear buttons and separator.
   * @param {boolean} show - true = show them, false = hide them.
   */
  function toggleButtons(show) {
    if (show) {
      addButton.classList.add("hidden");
      confirmButton.classList.remove("hidden");
      clearButton.classList.remove("hidden");
      vector.classList.remove("hidden");
    } else {
      addButton.classList.remove("hidden");
      confirmButton.classList.add("hidden");
      clearButton.classList.add("hidden");
      vector.classList.add("hidden");
    }
  }

  /**
   * Inline edit mode for a subtask: replaces text + icons with an input area
   * that has a trash icon (cancel) and check icon (save).
   * @param {HTMLElement} subtaskSpan
   */
  function handleInlineEdit(subtaskSpan) {
    const originalText = subtaskSpan.textContent.replace(/^•\s*/, "");
    const container = subtaskSpan.closest(".subtask-item-container");
    container.innerHTML = `
      <div class="input-subtask-wrapper editing-subtask">
        <input type="text" class="subtask-edit-input" value="${originalText}" />
        <div class="subtask-buttons">
          <button class="cancel-edit"><img src="./assets/img/icons/addTask/delete_icon.svg" alt="Cancel Edit"></button>
          <button class="confirm-edit"><img src="./assets/img/icons/addTask/check_Subtasks_icon.svg" alt="Confirm Edit"></button>
        </div>
      </div>
    `;
    const editInput = container.querySelector(".subtask-edit-input");
    const cancelBtn = container.querySelector(".cancel-edit");
    const confirmBtn = container.querySelector(".confirm-edit");
    editInput.focus();

    /**
     * Restores normal mode with final text.
     * @param {string} text
     */
    function restoreView(text) {
      container.innerHTML = `
        <span class="subtask-text">• ${text}</span>
        <div class="subtask-li-icons-container">
          <img src="./assets/img/icons/addTask/edit_icon.svg" alt="Edit" class="edit-subtask">
          <div>|</div>
          <img src="./assets/img/icons/addTask/delete_icon.svg" alt="Delete" class="delete-subtask">
        </div>
      `;
      const newSpan = container.querySelector(".subtask-text");
      const editIcon = container.querySelector(".edit-subtask");
      const deleteIcon = container.querySelector(".delete-subtask");
      editIcon.addEventListener("click", () => handleInlineEdit(newSpan));
      newSpan.addEventListener("dblclick", () => handleInlineEdit(newSpan));
      deleteIcon.addEventListener("click", () => container.parentNode.remove());
    }

    cancelBtn.addEventListener("click", () => restoreView(originalText));
    confirmBtn.addEventListener("click", () => {
      const newText = editInput.value.trim() || originalText;
      restoreView(newText);
    });
    editInput.addEventListener("keydown", e => {
      if (e.key === "Enter") confirmBtn.click();
      if (e.key === "Escape") cancelBtn.click();
    });
  }

  /**
   * Adds a new subtask to the list, including edit/delete event listeners.
   */
  function addSubtask() {
    const subtaskText = inputField.value.trim();
    if (!subtaskText) return;
    const listItem = document.createElement("li");
    listItem.classList.add("subtask-item");
    listItem.innerHTML = `
      <div class="subtask-item-container">
        <span class="subtask-text">• ${subtaskText}</span>
        <div class="subtask-li-icons-container">
          <img src="./assets/img/icons/addTask/edit_icon.svg" alt="Edit" class="edit-subtask">
          <div>|</div>
          <img src="./assets/img/icons/addTask/delete_icon.svg" alt="Delete" class="delete-subtask">
        </div>
      </div>
    `;
    subtaskList.appendChild(listItem);
    const editIcon = listItem.querySelector(".edit-subtask");
    const deleteIcon = listItem.querySelector(".delete-subtask");
    const subtaskSpan = listItem.querySelector(".subtask-text");
    editIcon.addEventListener("click", () => handleInlineEdit(subtaskSpan));
    subtaskSpan.addEventListener("dblclick", () => handleInlineEdit(subtaskSpan));
    deleteIcon.addEventListener("click", () => listItem.remove());
    inputField.value = "";
    toggleButtons(false);
  }

  /**
   * Clears all form fields, resets subtasks and priority to "Medium."
   */
  function clearAllFields() {
    titleInput.value = "";
    document.querySelector('textarea[placeholder="Enter a Description"]').value = "";
    document.querySelector('input[list="assignees"]').value = "";
    dueDateInput.value = "";
    categorySelect.value = "";
    subtaskList.innerHTML = "";
    inputField.value = "";
    confirmButton.classList.add("hidden");
    clearButton.classList.add("hidden");
    vector.classList.add("hidden");
    addButton.classList.remove("hidden");
    document.querySelectorAll(".prio-option").forEach(opt => opt.classList.remove("selected"));
    const medium = document.querySelector('.prio-option[data-prio="medium"]');
    if (medium) medium.classList.add("selected");
    validateForm();
  }

  // Subtask input logic
  inputField.addEventListener("input", () => toggleButtons(Boolean(inputField.value.trim())));
  confirmButton.addEventListener("click", addSubtask);
  inputField.addEventListener("keypress", e => { if (e.key === "Enter") addSubtask(); });
  clearButton.addEventListener("click", () => { inputField.value = ""; toggleButtons(false); });

  // Bottom "Clear All Fields" button
  bottomClearButton.addEventListener("click", e => {
    e.preventDefault();
    clearAllFields();
  });

  // Priority selection
  const prioOptions = document.querySelectorAll(".prio-option");
  prioOptions.forEach(option => {
    option.addEventListener("click", () => {
      prioOptions.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
    });
  });

  // Validate form fields on input/change, and on page load
  [titleInput, dueDateInput, categorySelect].forEach(el => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", validateForm);
  });
  validateForm();

  // Firebase Tasks Endpoint (update if needed)
  const FIREBASE_TASKS_URL =
    "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  // Create Task: Gather form data and push to Firebase
  createTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Check required fields again
    if (titleInput.value.trim() === "" || dueDateInput.value === "" || categorySelect.value === "") {
      alert("Please fill in all required fields.");
      return;
    }

    // Gather form data
    const title = titleInput.value.trim();
    const description = document
      .querySelector('textarea[placeholder="Enter a Description"]')
      .value.trim();
    const assignedTo = document
      .querySelector('input[list="assignees"]')
      .value.trim();
    const dueDate = dueDateInput.value;
    const selectedPrio =
      document.querySelector(".prio-option.selected")?.dataset.prio || "medium";
    const category = categorySelect.value;

    // Get all subtasks from the list (remove the bullet "• " from each)
    const subtaskElements = document.querySelectorAll("#subtask-list li .subtask-text");
    const subtasks = [];
    subtaskElements.forEach((el) => {
      subtasks.push(el.textContent.replace(/^•\s*/, "").trim());
    });

    // Create a task object to send to Firebase
    const newTask = {
      title,
      description,
      assignedTo,
      dueDate,
      priority: selectedPrio,
      category,
      subtasks,
      createdAt: new Date().toISOString(),
    };

    // Push the task to Firebase using a POST request
    fetch(FIREBASE_TASKS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Task added successfully:", data);
        // Show the success popup
        const popupSuccess = document.getElementById("popupSuccess");
        popupSuccess.style.display = "flex";
        setTimeout(() => {
          popupSuccess.style.display = "none";
        }, 2000);

        // Optionally clear the form fields after success
        clearAllFields();
      })
      .catch((error) => {
        console.error("Error adding task:", error);
        alert("There was an error adding your task. Please try again.");
      });
  });
});
