// Example JSON data (can be fetched from an API)
const contacts = [
    { name: "John Doe" },
    { name: "Jane Smith" },
    { name: "Alex Johnson" },
    { name: "Emily Davis" }
];

// Get the datalist element
const datalist = document.getElementById("assignees");

// Populate datalist with options
contacts.forEach(contact => {
    let option = document.createElement("option");
    option.value = contact.name;
    datalist.appendChild(option);
});

document.addEventListener("DOMContentLoaded", () => {
    const inputField     = document.getElementById("subtask-input");
    const addButton      = document.getElementById("add-subtask-btn");
    const clearButton    = document.getElementById("clear-subtask");
    const confirmButton  = document.getElementById("confirm-subtask");
    const vector         = document.getElementById("vector");        // <-- The gray separator
    const subtaskList    = document.getElementById("subtask-list");

    /**
     * Toggles visibility of the confirm, clear, and vector elements
     * depending on whether the user is currently typing a subtask.
     */
    function toggleButtons(showConfirm) {
        if (showConfirm) {
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
     * Creates a new subtask <li> with the text, plus
     * pencil, gray vector, and trash icons.
     */
    function addSubtask() {
        const subtaskText = inputField.value.trim();
        if (subtaskText === "") return;

        // Create subtask item
        const listItem = document.createElement("li");
        listItem.classList.add("subtask-item");
        listItem.innerHTML = `
            <div class="subtask-item-container">
                <span>• ${subtaskText}</span>
                <div class="subtask-li-icons-container">
                    <img src="./assets/img/icons/addTask/edit_icon.svg" alt="Edit Icon">
                    <div>|</div>
                    <img src="./assets/img/icons/addTask/delete_icon.svg" alt="Delete Icon">
                </div>
            </div>
        `;

        // Append to list
        subtaskList.appendChild(listItem);

        // Reset input field and buttons
        inputField.value = "";
        toggleButtons(false);
    }

    // Show confirm & clear buttons (and the gray separator) when typing
    inputField.addEventListener("input", () => {
        if (inputField.value.trim()) {
            toggleButtons(true);
        } else {
            toggleButtons(false);
        }
    });

    // Confirm button adds subtask
    confirmButton.addEventListener("click", addSubtask);

    // Enter key adds subtask
    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            addSubtask();
        }
    });

    // Clear button resets input and hides confirm & vector
    clearButton.addEventListener("click", () => {
        inputField.value = "";
        toggleButtons(false);
    });
});
