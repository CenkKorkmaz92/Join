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
    // References for subtask input / buttons
    const inputField = document.getElementById("subtask-input");
    const addButton = document.getElementById("add-subtask-btn");
    const clearButton = document.getElementById("clear-subtask");
    const confirmButton = document.getElementById("confirm-subtask");
    const vector = document.getElementById("vector");
    const subtaskList = document.getElementById("subtask-list");
    const prioOptions = document.querySelectorAll(".prio-option");

    // Listen for clicks on each priority button
    prioOptions.forEach(option => {
        option.addEventListener("click", () => {
            // Remove 'selected' from all first
            prioOptions.forEach(o => o.classList.remove("selected"));
            // Add 'selected' to the clicked option
            option.classList.add("selected");
        });
    });

    // Reference to the bottom Clear button (the big one in the bottom container)
    const bottomClearButton = document.getElementById("clear-all-fields-btn");

    /**
     * Toggles visibility of the subtask confirm, clear, and vector elements
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

        // Create the <li> element
        const listItem = document.createElement("li");
        listItem.classList.add("subtask-item");
        listItem.innerHTML = `
            <div class="subtask-item-container">
                <!-- Use a class .subtask-text so we can easily edit it -->
                <span class="subtask-text">• ${subtaskText}</span>
    
                <div class="subtask-li-icons-container">
                    <!-- Pencil Icon for edit -->
                    <img src="./assets/img/icons/addTask/edit_icon.svg" 
                         alt="Edit Icon" 
                         class="edit-subtask">
    
                    <div>|</div>
    
                    <!-- Trash Icon for delete -->
                    <img src="./assets/img/icons/addTask/delete_icon.svg" 
                         alt="Delete Icon" 
                         class="delete-subtask">
                </div>
            </div>
        `;

        // Append the subtask item
        subtaskList.appendChild(listItem);

        // 1) Get references to the new elements
        const editIcon = listItem.querySelector(".edit-subtask");
        const deleteIcon = listItem.querySelector(".delete-subtask");
        const subtaskSpan = listItem.querySelector(".subtask-text");

        // 2) Define a function to edit the text
        function handleEdit() {
            // Remove the leading "• " to prompt only the actual text
            const currentText = subtaskSpan.textContent.replace(/^•\s/, "");

            // Ask the user for a new text; if they click cancel, it returns null
            const updatedText = prompt("Edit subtask:", currentText);

            // If the user pressed OK and typed something non-empty
            if (updatedText !== null && updatedText.trim() !== "") {
                subtaskSpan.textContent = `• ${updatedText}`;
            }
        }

        // 3) Pencil icon click => edit
        editIcon.addEventListener("click", handleEdit);

        // 4) Double-click on the text => edit
        subtaskSpan.addEventListener("dblclick", handleEdit);

        // 5) Trash icon => delete subtask
        deleteIcon.addEventListener("click", () => {
            listItem.remove();
        });

        // Finally, reset the input & toggle subtask input buttons
        inputField.value = "";
        toggleButtons(false);
    }


    /**
     * Clears ALL fields in the Add Task form (title, description, date, etc.),
     * as well as subtasks and priority selection. Invoked by bottomClearButton.
     */
    function clearAllFields() {
        // 1) Clear Title & Description
        document.querySelector('input[placeholder="Enter a title"]').value = "";
        document.querySelector('textarea[placeholder="Enter a Description"]').value = "";

        // 2) Clear Assigned to
        document.querySelector('input[list="assignees"]').value = "";

        // 3) Clear Date
        document.querySelector('input[type="date"]').value = "";

        // 4) Reset Category (go back to placeholder)
        document.getElementById("category").value = "";

        // 5) Clear Subtask list
        subtaskList.innerHTML = "";

        // 6) Reset subtask input field & hide confirm/clear buttons
        inputField.value = "";
        confirmButton.classList.add("hidden");
        clearButton.classList.add("hidden");
        vector.classList.add("hidden");
        addButton.classList.remove("hidden");

        // 7) (Optional) Reset priority to "Medium"
        document.querySelectorAll('.prio-option').forEach(option => {
            option.classList.remove('selected');
        });
        // Then set "medium" as selected again
        const mediumOption = document.querySelector('.prio-option[data-prio="medium"]');
        if (mediumOption) {
            mediumOption.classList.add('selected');
        }
    }

    // Subtask Input Field events
    inputField.addEventListener("input", () => {
        if (inputField.value.trim()) {
            toggleButtons(true);
        } else {
            toggleButtons(false);
        }
    });

    // Confirm button for subtask
    confirmButton.addEventListener("click", addSubtask);

    // Add subtask on Enter key
    inputField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            addSubtask();
        }
    });

    // Clear button (X) for subtask input
    clearButton.addEventListener("click", () => {
        inputField.value = "";
        toggleButtons(false);
    });

    // Bottom Clear button (the big one in add-task-bottom-container)
    bottomClearButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default if inside a <form>
        clearAllFields(); d
    });
});
