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
        console.log(`Subtasks patched for task: ${firebaseId}`);
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
        console.log(`Task ${firebaseId} status updated to ${newStatus}`);
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
        console.log('Task created:', data);
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
        console.log(`Task ${firebaseId} deleted successfully`);
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
        console.log(`Task ${firebaseId} updated successfully`);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}
