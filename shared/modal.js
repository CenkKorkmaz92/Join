// Define the openModal function in the global scope
function openModal() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.remove('hidden');
  }
  
  // Define the closeModal function in the global scope
  function closeModal() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.add('hidden');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // Attach event listener to the add task button in the board header
    const addTaskBoardButton = document.querySelector('.add-task-btn-summary');
    if (addTaskBoardButton) {
      addTaskBoardButton.addEventListener('click', openModal);
    }
  
    // Attach event listeners to all the + images in your columns
    const plusIcons = document.querySelectorAll('.open-modal'); // Ensure these images have the class "open-modal"
    plusIcons.forEach(icon => {
      icon.addEventListener('click', openModal);
    });
  
    // Optional: Close the modal when clicking on the overlay
    const modal = document.getElementById('addTaskModal');
    modal.addEventListener('click', (event) => {
      if (event.target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });
  });
  