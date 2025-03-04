/**
 * addTaskService.js
 * Low-level operations for fetching contacts and posting tasks to Firebase.
 */

const FIREBASE_CONTACTS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/contacts.json';

const FIREBASE_TASKS_URL =
    'https://join-cenk-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

/**
 * Fetch all contacts from Firebase.
 */
export async function fetchAllContacts() {
    try {
        const response = await fetch(FIREBASE_CONTACTS_URL);
        const data = await response.json();
        return data || {};
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return {};
    }
}

/**
 * Push a new task to Firebase.
 */
export async function postNewTask(taskData) {
    try {
        const response = await fetch(FIREBASE_TASKS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error('Failed to add task');
        return await response.json();
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
}
