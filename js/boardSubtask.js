/**
 * boardSubtask.js
 * Functions for handling subtask format and toggling 'done'.
 */

import { patchSubtasks } from './boardTaskService.js';

/**
 * Convert string subtasks to {text, done:false} objects if needed.
 */
export function fixSubtaskFormat(task) {
    const subs = task.subtasks;
    if (!subs || !Array.isArray(subs) || typeof subs[0] !== 'string') return;

    console.log(`Converting string subtasks for task ${task.firebaseId}`);
    const newSubtasks = subs.map((s) => ({ text: s, done: false }));
    task.subtasks = newSubtasks;
    patchSubtasks(task.firebaseId, newSubtasks);
}

/**
 * Toggle subtask 'done' status locally, then PATCH in Firebase.
 */
export async function toggleSubtaskDone(task, index, isDone, updateCardCb) {
    task.subtasks[index].done = isDone;
    const updated = task.subtasks.map((s) => ({ text: s.text, done: s.done }));
    await patchSubtasks(task.firebaseId, updated);
    updateCardCb(task.firebaseId, updated); // e.g. update the small card progress
}
