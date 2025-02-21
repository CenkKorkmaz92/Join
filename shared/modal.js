/**
 * modal.js
 * Central place for opening/closing all modals in board.html
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------
   *  ADD TASK MODAL
   * ---------------------- */
  const addTaskModalId = "addTaskModal";
  const addTaskButton = document.querySelector(".add-task-btn-summary");
  const plusIcons = document.querySelectorAll(".open-modal"); // The small + icons in the columns
  const addTaskModal = document.getElementById(addTaskModalId);
  const addTaskOverlay = addTaskModal?.querySelector(".add-task-overlay");

  // Open Add Task Modal when the "Add task" button is clicked
  if (addTaskButton) {
    addTaskButton.addEventListener("click", () => openModal(addTaskModalId));
  }

  // Also open Add Task Modal when the small plus icon is clicked
  plusIcons.forEach((icon) => {
    icon.addEventListener("click", () => openModal(addTaskModalId));
  });

  // Close Add Task Modal when the user clicks on the overlay (outside the modal content)
  if (addTaskOverlay) {
    addTaskOverlay.addEventListener("click", (event) => {
      // Ensure we only close if they actually clicked *on the overlay* itself
      if (event.target === addTaskOverlay) {
        closeModal(addTaskModalId);
      }
    });
  }

  /* ----------------------
   *  VIEW TASK MODAL
   * ---------------------- */
  const viewTaskModalId = "viewTaskModal";
  const closeViewTaskButton = document.getElementById("closeViewTaskModalBtn");
  const viewTaskOverlay = document.getElementById("closeViewTaskModalOverlay");

  // Close the big card modal via the close button
  if (closeViewTaskButton) {
    closeViewTaskButton.addEventListener("click", () =>
      closeModal(viewTaskModalId)
    );
  }

  // Close the big card modal via the backdrop
  if (viewTaskOverlay) {
    viewTaskOverlay.addEventListener("click", () =>
      closeModal(viewTaskModalId)
    );
    // If you only want to close when exactly clicking the overlay (and not some child), do:
    // viewTaskOverlay.addEventListener('click', (event) => {
    //   if (event.target === viewTaskOverlay) closeModal(viewTaskModalId);
    // });
  }
});

/**
 * Opens a modal by removing the 'hidden' class.
 * @param {string} modalId - The ID of the modal to open.
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
  } else {
    console.warn(`openModal: No modal found with ID "${modalId}"`);
  }
}

/**
 * Closes a modal by adding the 'hidden' class.
 * @param {string} modalId - The ID of the modal to close.
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
  } else {
    console.warn(`closeModal: No modal found with ID "${modalId}"`);
  }
}
