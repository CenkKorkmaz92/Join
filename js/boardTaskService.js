/**
 * boardTaskService.js
 * Low-level CRUD operations for tasks (Firebase).
 */

/**
 * PATCH subtasks array to Firebase (used if the subtask format needs updating).
 */
export async function patchSubtasks(firebaseId, newSubtasks) {
    const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
    try {
        await fetch(updateUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtasks: newSubtasks }),
        });
    } catch (error) {
        console.error('Error patching subtasks:', error);
    }
}

/**
 * Update a task's status in Firebase (drag-and-drop column changes).
 */
export async function updateTaskStatusInFirebase(firebaseId, newStatus) {
    const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
    try {
        await fetch(updateUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

/**
 * Add a new task to Firebase.
 */
export async function addTask(newTaskData) {
    const baseUrl =
        'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskData),
        });
        const data = await response.json();
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

/**
 * Delete a task from Firebase by its ID.
 */
export async function deleteTask(firebaseId) {
    const deleteUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
    try {
        await fetch(deleteUrl, { method: 'DELETE' });
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

/**
 * Update (PATCH) a task's entire object in Firebase.
 */
export async function patchTask(firebaseId, updatedTask) {
    const updateUrl = `https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseId}.json`;
    try {
        await fetch(updateUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        });
    } catch (error) {
        console.error('Error updating task:', error);
    }
}
