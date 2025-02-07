
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
    const inputField = document.getElementById("subtask-input");
    const addButton = document.getElementById("add-subtask-btn");
    const clearButton = document.getElementById("clear-subtask");
    const confirmButton = document.getElementById("confirm-subtask");
    const subtaskList = document.getElementById("subtask-list");

    function toggleButtons(showConfirm) {
        if (showConfirm) {
            addButton.classList.add("hidden");
            confirmButton.classList.remove("hidden");
            clearButton.classList.remove("hidden");
        } else {
            addButton.classList.remove("hidden");
            confirmButton.classList.add("hidden");
            clearButton.classList.add("hidden");
        }
    }

    function addSubtask() {
        const subtaskText = inputField.value.trim();
        if (subtaskText === "") return;

        // Create subtask item
        const listItem = document.createElement("li");
        listItem.classList.add("subtask-item");
        listItem.innerHTML = `<span>• ${subtaskText}</span>`;

        // Append to list
        subtaskList.appendChild(listItem);

        // Reset input field and buttons
        inputField.value = "";
        toggleButtons(false);
    }

    // Show confirm & clear buttons when typing
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

    // Clear button resets input
    clearButton.addEventListener("click", () => {
        inputField.value = "";
        toggleButtons(false);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const prioOptions = document.querySelectorAll(".prio-option");

    prioOptions.forEach(option => {
        option.addEventListener("click", () => {
            // Remove 'selected' class from all options
            prioOptions.forEach(opt => opt.classList.remove("selected"));

            // Add 'selected' class to clicked option
            option.classList.add("selected");
        });
    });
});


