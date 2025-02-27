/**
 * @file Manages the Add Task page: fetching contacts from Firebase,
 * multi-select for "Assigned to," subtask creation, editing, deletion,
 * form clearing, priority/date logic, and enabling/disabling the Create Task button.
 */

/** Firebase endpoints */
const FIREBASE_CONTACTS_URL =
  "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
const FIREBASE_TASKS_URL =
  "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // DOM References
  // --------------------------------------------------------------------------
  const titleInput = document.querySelector('input[placeholder="Enter a title"]');
  const dueDateInput = document.querySelector('input[type="date"]');
  const categorySelect = document.getElementById("category");
  const createTaskBtn = document.querySelector(".create-btn");

  // Subtask references
  const inputField = document.getElementById("subtask-input");
  const addButton = document.getElementById("add-subtask-btn");
  const clearButton = document.getElementById("clear-subtask");
  const confirmButton = document.getElementById("confirm-subtask");
  const vector = document.getElementById("vector");
  const subtaskList = document.getElementById("subtask-list");
  const bottomClearButton = document.getElementById("clear-all-fields-btn");

  // Multi-select contacts
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownArrow = document.getElementById("dropdownArrow");
  const contactsDropdownList = document.getElementById("contactsDropdownList");
  const selectedContactsContainer = document.getElementById(
    "selectedContactsContainer"
  );
  const dropdownPlaceholder = document.getElementById("dropdownPlaceholder");

  let allContacts = [];      // All contacts from Firebase
  let selectedContacts = []; // Which contacts are selected
  let dropdownOpen = false;

  // --------------------------------------------------------------------------
  // Fetch Contacts
  // --------------------------------------------------------------------------
  fetch(FIREBASE_CONTACTS_URL)
    .then((response) => response.json())
    .then((data) => {
      console.log("Contacts data from Firebase:", data);
      if (!data) {
        console.warn("No contacts found or data is null");
        return;
      }

      // Convert object to array
      allContacts = Object.entries(data).map(([pushKey, contactObj]) => ({
        firebaseId: pushKey,
        fullName: contactObj.fullName,
        color: contactObj.color,
        initials: contactObj.initials,
        // If you have email, add it here:
        // email: contactObj.email
      }));

      console.log("allContacts array:", allContacts);
      renderContactsDropdown(allContacts);
    })
    .catch((error) => {
      console.error("Error fetching contacts:", error);
    });

  /**
   * Renders the list of contacts (with checkboxes) inside the dropdown.
   */
  function renderContactsDropdown(contactsArray) {
    contactsDropdownList.innerHTML = ""; // Clear old items

    contactsArray.forEach((contact) => {
      // Build the container
      const item = document.createElement("div");
      item.className = "contact-list-item";

      // Avatar
      const avatar = document.createElement("div");
      avatar.className = "contact-avatar";
      avatar.style.backgroundColor = contact.color || "#999";
      avatar.textContent = contact.initials || "?";

      // Label
      const label = document.createElement("span");
      label.className = "contact-label";
      label.textContent = contact.fullName;

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedContacts.push(contact);
        } else {
          selectedContacts = selectedContacts.filter(
            (c) => c.firebaseId !== contact.firebaseId
          );
        }
        updateSelectedContactsUI();
      });

      // Append everything
      item.appendChild(avatar);
      item.appendChild(label);
      item.appendChild(checkbox);

      contactsDropdownList.appendChild(item);
    });
  }

  /**
   * Updates the chips shown for selected contacts.
   */
  function updateSelectedContactsUI() {
    // Clear existing chips
    selectedContactsContainer.innerHTML = "";

    selectedContacts.forEach((contact) => {
      const chip = document.createElement("div");
      chip.className = "contact-chip";
      chip.style.backgroundColor = contact.color || "#999";
      chip.textContent = contact.initials || "?";
      selectedContactsContainer.appendChild(chip);
    });

    if (selectedContacts.length > 0) {
      dropdownPlaceholder.textContent = `${selectedContacts.length} contact(s) selected`;
    } else {
      dropdownPlaceholder.textContent = "Select contact(s)";
    }
  }

  // --------------------------------------------------------------------------
  // Toggle dropdown open/close
  // --------------------------------------------------------------------------
  dropdownToggle.addEventListener("click", () => {
    dropdownOpen = !dropdownOpen;
    contactsDropdownList.classList.toggle("hidden", !dropdownOpen);
    dropdownArrow.classList.toggle("rotated", dropdownOpen);
  });

  // Close dropdown if clicked outside
  window.addEventListener("click", (e) => {
    if (
      !dropdownToggle.contains(e.target) &&
      !contactsDropdownList.contains(e.target)
    ) {
      dropdownOpen = false;
      contactsDropdownList.classList.add("hidden");
      dropdownArrow.classList.remove("rotated");
    }
  });

  // --------------------------------------------------------------------------
  // Form Validation
  // --------------------------------------------------------------------------
  function validateForm() {
    const titleFilled = titleInput.value.trim() !== "";
    const dateFilled = dueDateInput.value !== "";
    const categoryFilled = categorySelect.value !== "";
    createTaskBtn.disabled = !(titleFilled && dateFilled && categoryFilled);
  }

  // --------------------------------------------------------------------------
  // Subtask Logic
  // --------------------------------------------------------------------------
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

    // Edit subtask event
    editIcon.addEventListener("click", () => handleInlineEdit(subtaskSpan));
    subtaskSpan.addEventListener("dblclick", () => handleInlineEdit(subtaskSpan));

    // Delete subtask event
    deleteIcon.addEventListener("click", () => listItem.remove());

    // Reset input field
    inputField.value = "";
    toggleButtons(false);
  }

  function handleInlineEdit(subtaskSpan) {
    const originalText = subtaskSpan.textContent.replace(/^•\s*/, "");
    const container = subtaskSpan.closest(".subtask-item-container");
    container.innerHTML = `
      <div class="input-subtask-wrapper editing-subtask">
        <input type="text" class="subtask-edit-input" value="${originalText}" />
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

    const editInput = container.querySelector(".subtask-edit-input");
    const cancelBtn = container.querySelector(".cancel-edit");
    const confirmBtn = container.querySelector(".confirm-edit");

    editInput.focus();

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

    // Cancel edit
    cancelBtn.addEventListener("click", () => restoreView(originalText));

    // Confirm edit
    confirmBtn.addEventListener("click", () => {
      const newText = editInput.value.trim() || originalText;
      restoreView(newText);
    });

    // Keyboard shortcuts
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmBtn.click();
      if (e.key === "Escape") cancelBtn.click();
    });
  }

  // --------------------------------------------------------------------------
  // Clearing Fields
  // --------------------------------------------------------------------------
  function clearAllFields() {
    titleInput.value = "";
    document.querySelector('textarea[placeholder="Enter a Description"]').value = "";
    dueDateInput.value = "";
    categorySelect.value = "";
    subtaskList.innerHTML = "";
    inputField.value = "";
    confirmButton.classList.add("hidden");
    clearButton.classList.add("hidden");
    vector.classList.add("hidden");
    addButton.classList.remove("hidden");

    // Clear priority selection
    document
      .querySelectorAll(".prio-option")
      .forEach((opt) => opt.classList.remove("selected"));
    const mediumPrio = document.querySelector('.prio-option[data-prio="medium"]');
    if (mediumPrio) mediumPrio.classList.add("selected");

    // Clear selected contacts
    selectedContacts = [];
    updateSelectedContactsUI();

    validateForm();
  }

  // --------------------------------------------------------------------------
  // Event Listeners for Subtasks, Priority, Clearing
  // --------------------------------------------------------------------------
  inputField.addEventListener("input", () =>
    toggleButtons(Boolean(inputField.value.trim()))
  );
  confirmButton.addEventListener("click", addSubtask);
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addSubtask();
  });
  clearButton.addEventListener("click", () => {
    inputField.value = "";
    toggleButtons(false);
  });

  bottomClearButton.addEventListener("click", (e) => {
    e.preventDefault();
    clearAllFields();
  });

  const prioOptions = document.querySelectorAll(".prio-option");
  prioOptions.forEach((option) => {
    option.addEventListener("click", () => {
      prioOptions.forEach((o) => o.classList.remove("selected"));
      option.classList.add("selected");
    });
  });

  [titleInput, dueDateInput, categorySelect].forEach((el) => {
    el.addEventListener("input", validateForm);
    el.addEventListener("change", validateForm);
  });
  validateForm();

  // --------------------------------------------------------------------------
  // Create Task & Push to Firebase
  // --------------------------------------------------------------------------
  createTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Ensure required fields are filled
    if (
      titleInput.value.trim() === "" ||
      dueDateInput.value === "" ||
      categorySelect.value === ""
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Gather form data
    const title = titleInput.value.trim();
    const description = document
      .querySelector('textarea[placeholder="Enter a Description"]')
      .value.trim();
    const dueDate = dueDateInput.value;
    const selectedPrio =
      document.querySelector(".prio-option.selected")?.dataset.prio || "medium";
    const category = categorySelect.value;

    // Gather subtasks as an array of strings
    const subtaskElements = document.querySelectorAll(
      "#subtask-list li .subtask-text"
    );
    const subtasks = [];
    subtaskElements.forEach((el) => {
      subtasks.push(el.textContent.replace(/^•\s*/, "").trim());
    });

    // selectedContacts is an array of contact objects; 
    // store the same firebaseId so that board.js can match them
    const assignedTo = selectedContacts.map((c) => ({
      firebaseId: c.firebaseId,
      fullName: c.fullName,
      initials: c.initials,
      color: c.color,
      // email: c.email, // only if needed
    }));

    // Create a task object
    const newTask = {
      title,
      description,
      assignedTo,
      dueDate,
      priority: selectedPrio,
      category,
      subtasks, // plain strings; board.js will convert if needed
      createdAt: new Date().toISOString(),
      // status defaults to "toDo" or similar if you want
    };

    // Push to Firebase
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

        // Show success popup
        const popupSuccess = document.getElementById("popupSuccess");
        popupSuccess.style.display = "flex";
        setTimeout(() => {
          popupSuccess.style.display = "none";
          // Optionally navigate back to board
          window.location.href = "board.html";
        }, 1000);

        // Clear the form
        clearAllFields();
      })
      .catch((error) => {
        console.error("Error adding task:", error);
        alert("There was an error adding your task. Please try again.");
      });
  });
});
