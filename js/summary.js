/**
 * Aktualisiert den Textinhalt eines DOM-Elements.
 * @param {string} id - Die ID des Elements.
 * @param {string|number} text - Der darzustellende Text.
 */
function updateText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Berechnet Metriken und findet die früheste anstehende Deadline.
 * @param {Array} tasks - Array von Task-Objekten.
 * @returns {object} Enthält die Metriken und den Task mit der frühesten Deadline.
 */
function computeMetrics(tasks) {
  const now = new Date(), metrics = { toDo: 0, done: 0, inProgress: 0, awaitFeedback: 0, urgent: 0 };
  let earliestTask = null, earliestDate = Infinity;
  tasks.forEach(task => {
    const s = task.status || "toDo";
    if (metrics[s] !== undefined) metrics[s]++;
    if (task.priority === "urgent") metrics.urgent++;
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d) && d >= now && d < earliestDate) { earliestDate = d; earliestTask = task; }
    }
  });
  return { metrics, earliest: earliestTask };
}

/**
 * Lädt Tasks von Firebase, berechnet Metriken und aktualisiert die DOM-Elemente.
 */
function updateSummaryMetrics() {
  fetch("https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json")
    .then(r => r.json())
    .then(data => {
      if (!data) return ["summaryTodoCount", "summaryDoneCount", "summaryUpcomingDeadline", "summaryBoardTasks", "summaryProgressTasks", "summaryAwaitFeedbackTasks", "summaryExtraMetric"]
        .forEach(id => updateText(id, id === "summaryUpcomingDeadline" ? "No deadlines" : 0));
      const tasks = Object.entries(data).map(([id, task]) => ({ firebaseId: id, ...task })),
        { metrics, earliest } = computeMetrics(tasks);
      updateText("summaryTodoCount", metrics.toDo);
      updateText("summaryDoneCount", metrics.done);
      updateText("summaryBoardTasks", tasks.length);
      updateText("summaryProgressTasks", metrics.inProgress);
      updateText("summaryAwaitFeedbackTasks", metrics.awaitFeedback);
      updateText("summaryExtraMetric", metrics.urgent);
      updateText("summaryUpcomingDeadline", earliest ? new Date(earliest.dueDate).toLocaleDateString() : "No deadlines");
    }).catch(err => console.error("Error fetching tasks:", err));
}

/**
 * Aktualisiert die Begrüßung mit dem Namen des eingeloggten Users.
 */
function updateGreeting() {
  const u = localStorage.getItem("loggedInUser");
  if (u) { const user = JSON.parse(u), el = document.querySelector(".user-name"); if (el) el.textContent = user.name; }
}

document.addEventListener("DOMContentLoaded", () => { updateGreeting(); updateSummaryMetrics(); });


document.addEventListener('DOMContentLoaded', function() {
  // Aktuelle Zeit holen
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  // Gesamtminuten seit Mitternacht berechnen
  const totalMinutes = hours * 60 + minutes;
  
  let greeting = "";
  
  if (totalMinutes >= 240 && totalMinutes <= 720) { 
    // 4:00 bis 12:00
    greeting = "Good morning,";
  } else if (totalMinutes >= 721 && totalMinutes <= 1020) { 
    // 12:01 bis 17:00
    greeting = "Good afternoon,";
  } else {
    // 17:01 bis 23:59 und 0:00 bis 3:59
    greeting = "Good evening,";
  }
  
  // Begrüßung in das Element einsetzen
  document.querySelector('.day-time').textContent = greeting;
});