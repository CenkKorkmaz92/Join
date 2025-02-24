/**
 * Fetches tasks from Firebase and updates the summary metrics on the page.
 */
function updateSummaryMetrics() {
  const FIREBASE_TASKS_URL = 'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

  fetch(FIREBASE_TASKS_URL)
    .then(response => response.json())
    .then(data => {
      // If no tasks exist, reset all summary metrics to zero/default.
      if (!data) {
        document.getElementById("summaryTodoCount").textContent = 0;
        document.getElementById("summaryDoneCount").textContent = 0;
        document.getElementById("summaryUpcomingDeadline").textContent = "No deadlines";
        document.getElementById("summaryBoardTasks").textContent = 0;
        document.getElementById("summaryProgressTasks").textContent = 0;
        document.getElementById("summaryAwaitFeedbackTasks").textContent = 0;
        return;
      }

      // Convert the fetched object to an array of tasks.
      const tasks = Object.entries(data).map(([firebaseId, task]) => ({ firebaseId, ...task }));

      let countToDo = 0;
      let countDone = 0;
      let countInProgress = 0;
      let countAwaitFeedback = 0;
      let upcomingDeadlineTask = null;

      tasks.forEach(task => {
        // Ensure each task has a defined status; default to "toDo"
        const status = task.status || "toDo";

        if (status === "toDo") {
          countToDo++;
        } else if (status === "done") {
          countDone++;
        } else if (status === "inProgress") {
          countInProgress++;
        } else if (status === "awaitFeedback") {
          countAwaitFeedback++;
        }

        // Check for a deadline property and determine the closest upcoming deadline.
        if (task.deadline) {
          const taskDeadline = new Date(task.deadline);
          if (!isNaN(taskDeadline)) {
            const now = new Date();
            // Only consider future deadlines (or adjust logic as needed)
            if (taskDeadline >= now) {
              if (!upcomingDeadlineTask || taskDeadline < new Date(upcomingDeadlineTask.deadline)) {
                upcomingDeadlineTask = task;
              }
            }
          }
        }
      });

      // Update top summary counts
      document.getElementById("summaryTodoCount").textContent = countToDo;
      document.getElementById("summaryDoneCount").textContent = countDone;

      // Update the upcoming deadline display
      if (upcomingDeadlineTask && upcomingDeadlineTask.deadline) {
        const deadlineDate = new Date(upcomingDeadlineTask.deadline);
        document.getElementById("summaryUpcomingDeadline").textContent = deadlineDate.toLocaleDateString();
      } else {
        document.getElementById("summaryUpcomingDeadline").textContent = "No deadlines";
      }

      // Update bottom summary counts:
      // Here, we assume "Tasks in Board" refers to completed tasks (i.e. 'done'),
      // "Tasks in Progress" corresponds to 'inProgress', and "Awaiting Feedback" to 'awaitFeedback'.
      document.getElementById("summaryBoardTasks").textContent = countDone;
      document.getElementById("summaryProgressTasks").textContent = countInProgress;
      document.getElementById("summaryAwaitFeedbackTasks").textContent = countAwaitFeedback;
    })
    .catch(error => {
      console.error("Error fetching tasks for summary:", error);
    });
}

// Update the greeting using your existing logic.
document.addEventListener("DOMContentLoaded", () => {
  // Update the greeting with the logged-in user's name.
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    console.warn("No logged in user found in localStorage.");
    return;
  }

  const user = JSON.parse(loggedInUser);
  const userNameElem = document.querySelector(".user-name");
  if (userNameElem) {
    userNameElem.textContent = user.name;
  } else {
    console.error("Element with class 'user-name' not found.");
  }

  // Update summary metrics after greeting is set.
  updateSummaryMetrics();
});
