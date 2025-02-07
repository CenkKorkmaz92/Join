// addTask.js

/**
 * @file Manages the Add Task page: subtask creation, editing, deletion,
 *       form clearing, and basic priority/date logic.
 */

// Example JSON data for "Assigned to" (could be fetched from an API).
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
    // References for subtask input/buttons.
    const inputField    = document.getElementById("subtask-input");
    const addButton     = document.getElementById("add-subtask-btn");
    const clearButton   = document.getElementById("clear-subtask");
    const confirmButton = document.getElementById("confirm-subtask");
    const vector        = document.getElementById("vector");
    const subtaskList   = document.getElementById("subtask-list");
  
    // Reference to the bottom "Clear All Fields" button in the bottom container.
    const bottomClearButton = document.getElementById("clear-all-fields-btn");
  
    /**
     * Toggles visibility of subtask confirm/clear buttons and separator
     * based on whether the user is typing in the subtask input.
     * @function toggleButtons
     * @param {boolean} show - Whether to show the confirm/clear elements.
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
     * Opens an inline edit mode for a given subtask.
     * @function handleInlineEdit
     * @param {HTMLSpanElement} subtaskSpan - The <span> containing the subtask text.
     */
    function handleInlineEdit(subtaskSpan) {
      const currentText = subtaskSpan.textContent.replace(/^•\s/, "");
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentText;
      input.classList.add("subtask-edit-input");
      subtaskSpan.parentNode.replaceChild(input, subtaskSpan);
      input.focus();
  
      /**
       * Finalizes inline editing, either saving or discarding changes.
       * @param {boolean} save - If true, use new text; if false, revert to old text.
       */
      function finalizeEdit(save) {
        const newText = (save && input.value.trim()) ? input.value.trim() : currentText;
        subtaskSpan.textContent = `• ${newText}`;
        input.parentNode.replaceChild(subtaskSpan, input);
      }
  
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") finalizeEdit(true);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") finalizeEdit(false);
      });
      input.addEventListener("blur", () => finalizeEdit(true));
    }
  
    /**
     * Creates a new subtask <li>, attaches edit/delete logic, and appends it to #subtask-list.
     * @function addSubtask
     * @returns {void}
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
            <img src="./assets/img/icons/addTask/edit_icon.svg" alt="Edit Icon" class="edit-subtask">
            <div>|</div>
            <img src="./assets/img/icons/addTask/delete_icon.svg" alt="Delete Icon" class="delete-subtask">
          </div>
        </div>
      `;
  
      subtaskList.appendChild(listItem);
  
      const editIcon    = listItem.querySelector(".edit-subtask");
      const deleteIcon  = listItem.querySelector(".delete-subtask");
      const subtaskSpan = listItem.querySelector(".subtask-text");
  
      editIcon.addEventListener("click", () => handleInlineEdit(subtaskSpan));
      subtaskSpan.addEventListener("dblclick", () => handleInlineEdit(subtaskSpan));
      deleteIcon.addEventListener("click", () => listItem.remove());
  
      inputField.value = "";
      toggleButtons(false);
    }
  
    /**
     * Clears all form fields (title, description, date, assigned to, category, subtasks, etc.).
     * Resets subtask area and default priority to "Medium".
     * @function clearAllFields
     * @returns {void}
     */
    function clearAllFields() {
      document.querySelector('input[placeholder="Enter a title"]').value = "";
      document.querySelector('textarea[placeholder="Enter a Description"]').value = "";
      document.querySelector('input[list="assignees"]').value = "";
      document.querySelector('input[type="date"]').value = "";
      document.getElementById("category").value = "";
      subtaskList.innerHTML = "";
      inputField.value = "";
      confirmButton.classList.add("hidden");
      clearButton.classList.add("hidden");
      vector.classList.add("hidden");
      addButton.classList.remove("hidden");
      document.querySelectorAll('.prio-option').forEach(option => option.classList.remove('selected'));
      const mediumOption = document.querySelector('.prio-option[data-prio="medium"]');
      if (mediumOption) mediumOption.classList.add('selected');
    }
  
    // Subtask input field events.
    inputField.addEventListener("input", () => {
      toggleButtons(Boolean(inputField.value.trim()));
    });
    confirmButton.addEventListener("click", addSubtask);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addSubtask();
    });
    clearButton.addEventListener("click", () => {
      inputField.value = "";
      toggleButtons(false);
    });
  
    // Bottom "Clear All Fields" button.
    bottomClearButton.addEventListener("click", (e) => {
      e.preventDefault();
      clearAllFields();
    });
  
    /**
     * Lets user choose a priority. Removes "selected" from all, then sets it on the clicked one.
     */
    const prioOptions = document.querySelectorAll(".prio-option");
    prioOptions.forEach(option => {
      option.addEventListener("click", () => {
        prioOptions.forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");
      });
    });
  });
  