let originColumnId = null; // track the ID of the column from which we're dragging a card

document.addEventListener("DOMContentLoaded", () => {
    const FIREBASE_TASKS_URL =
        "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

    // 1. Fetch tasks from Firebase
    fetch(FIREBASE_TASKS_URL)
        .then((response) => response.json())
        .then((data) => {
            if (!data) {
                console.log("No tasks found");
                return;
            }

            // Convert the tasks object into an array
            const tasks = Object.entries(data).map(([firebaseId, task]) => ({
                firebaseId,
                ...task,
            }));

            // Loop through tasks and create a board card for each one
            tasks.forEach((task) => {
                // If your task doesn't have "status", default to "toDo"
                task.status = task.status || "toDo";
                createTaskCard(task);
            });
        })
        .catch((error) => console.error("Error fetching tasks:", error));

    // 2. Make each column droppable
    const columns = document.querySelectorAll(".board-list-column");
    columns.forEach((column) => {
        // Allow dropping by preventing default on dragover
        column.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        // Highlight the column on dragenter
        column.addEventListener("dragenter", (event) => {
            event.preventDefault();
            column.classList.add("hovered");
        });

        // Remove highlight on dragleave
        column.addEventListener("dragleave", (event) => {
            event.preventDefault();
            column.classList.remove("hovered");
        });

        // On drop, append the dragged card, update status, etc.
        column.addEventListener("drop", (event) => {
            event.preventDefault();
            // Remove highlight in case it stays
            column.classList.remove("hovered");

            const cardId = event.dataTransfer.getData("text/plain");
            const card = document.getElementById(cardId);

            if (card) {
                // Remove placeholder in the new column if it exists
                const placeholder = column.querySelector(".board-task-element");
                if (placeholder) {
                    placeholder.remove();
                }

                // Append the card to the new column
                column.appendChild(card);

                // If the old column is different, check if it's now empty
                if (originColumnId && originColumnId !== column.id) {
                    const oldColumn = document.getElementById(originColumnId);
                    if (oldColumn) {
                        const cardsLeft = oldColumn.querySelectorAll(".card-body").length;
                        // If no cards left, re-add the placeholder
                        if (cardsLeft === 0) {
                            const placeholderDiv = document.createElement("div");
                            placeholderDiv.classList.add("board-task-element");
                            placeholderDiv.textContent = "No tasks To do";
                            oldColumn.appendChild(placeholderDiv);
                        }
                    }
                }

                // Update the task’s status in Firebase (so it persists on refresh)
                const newStatus = column.id; // e.g. "toDo", "inProgress", "done"
                updateTaskStatusInFirebase(cardId, newStatus);
            }
        });
    });
});

/**
 * Creates a board card for a task by cloning the template,
 * filling in the task data, and appending it to the correct column.
 */
function createTaskCard(task) {
    const template = document.getElementById("cardTemplate");
    const cardClone = template.content.firstElementChild.cloneNode(true);

    // Give each card a unique ID for drag-and-drop
    cardClone.id = "card-" + task.firebaseId;
    cardClone.draggable = true;

    // On dragstart, store the card's ID and remember which column it came from
    cardClone.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", cardClone.id);
        originColumnId = cardClone.parentNode.id;
    });

    // Fill in the card with task data
    cardClone.querySelector(".category").textContent = task.category || "No category";
    cardClone.querySelector(".headline").textContent = task.title || "No title";
    cardClone.querySelector(".info").textContent = task.description || "";

    // Subtask placeholder
    const subtaskCount = task.subtasks ? task.subtasks.length : 0;
    cardClone.querySelector(".subtask-counter").textContent = `${subtaskCount} subtasks`;

    // Priority
    cardClone.querySelector(".prio").textContent = task.priority || "none";

    // Assigned contacts
    if (task.assignedTo && task.assignedTo.length > 0) {
        cardClone.querySelector(".chips").textContent = task.assignedTo
            .map((c) => c.initials || c.fullName || "??")
            .join(", ");
    } else {
        cardClone.querySelector(".chips").textContent = "";
    }

    // Append the card to the correct column
    const columnId = task.status || "toDo";
    const column = document.getElementById(columnId);
    if (column) {
        // Remove placeholder if present
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
 * Update the task status in Firebase so the new column persists on refresh.
 */
function updateTaskStatusInFirebase(cardId, newStatus) {
    // cardId is "card-<firebaseId>"
    const firebaseId = cardId.replace("card-", "");

    // Build the endpoint for that specific task
    const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;

    // PATCH the status field to the new column
    fetch(updateUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Task status updated:", data);
        })
        .catch((error) => {
            console.error("Error updating task status:", error);
        });
}
