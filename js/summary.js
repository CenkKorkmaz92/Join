function updateSummaryMetrics() {
  const FIREBASE_TASKS_URL =
    "https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  fetch(FIREBASE_TASKS_URL)
    .then((response) => response.json())
    .then((data) => {
      // If no tasks, set all counts to zero and exit
      if (!data) {
        document.getElementById("summaryTodoCount").textContent = 0;
        document.getElementById("summaryDoneCount").textContent = 0;
        document.getElementById("summaryUpcomingDeadline").textContent =
          "No deadlines";
        document.getElementById("summaryBoardTasks").textContent = 0;
        document.getElementById("summaryProgressTasks").textContent = 0;
        document.getElementById("summaryAwaitFeedbackTasks").textContent = 0;
        document.getElementById("summaryExtraMetric").textContent = 0; // Urgent tasks
        return;
      }

      // Convert object to array
      const tasks = Object.entries(data).map(([firebaseId, task]) => ({
        firebaseId,
        ...task,
      }));

      let countToDo = 0;
      let countDone = 0;
      let countInProgress = 0;
      let countAwaitFeedback = 0;
      let countUrgent = 0; // We'll track how many tasks have priority "urgent"

      let earliestDueDateTask = null;

      tasks.forEach((task) => {
        // Check status
        const status = task.status || "toDo";
        if (status === "toDo") countToDo++;
        if (status === "done") countDone++;
        if (status === "inProgress") countInProgress++;
        if (status === "awaitFeedback") countAwaitFeedback++;

        // Check if priority is urgent
        if (task.priority === "urgent") {
          countUrgent++;
        }

        // Track earliest upcoming due date
        if (task.dueDate) {
          const dueDateObj = new Date(task.dueDate);
          const now = new Date();
          if (!isNaN(dueDateObj) && dueDateObj >= now) {
            if (
              !earliestDueDateTask ||
              dueDateObj < new Date(earliestDueDateTask.dueDate)
            ) {
              earliestDueDateTask = task;
            }
          }
        }
      });

      // Update the DOM
      document.getElementById("summaryTodoCount").textContent = countToDo;
      document.getElementById("summaryDoneCount").textContent = countDone;
      document.getElementById("summaryBoardTasks").textContent = tasks.length;
      document.getElementById("summaryProgressTasks").textContent =
        countInProgress;
      document.getElementById("summaryAwaitFeedbackTasks").textContent =
        countAwaitFeedback;

      // Update the urgent prio tasks
      document.getElementById("summaryExtraMetric").textContent = countUrgent;

      // Earliest upcoming due date
      if (earliestDueDateTask && earliestDueDateTask.dueDate) {
        document.getElementById("summaryUpcomingDeadline").textContent =
          new Date(earliestDueDateTask.dueDate).toLocaleDateString();
      } else {
        document.getElementById("summaryUpcomingDeadline").textContent =
          "No deadlines";
      }
    })
    .catch((error) => {
      console.error("Error fetching tasks for summary:", error);
    });
}


/**
 * Runs after the DOM is fully loaded.
 *  - Updates the greeting with the logged-in user's name (if any).
 *  - Calls updateSummaryMetrics() to load the data.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the stored user from localStorage
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    const user = JSON.parse(loggedInUser);
    const userNameElem = document.querySelector(".user-name");
    if (userNameElem) {
      userNameElem.textContent = user.name;
    }
  }

  // Then update the summary metrics
  updateSummaryMetrics();
});
