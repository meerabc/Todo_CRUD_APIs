const crypto = require('crypto');

// In-memory storage. Replace with a real DB later if needed.
let tasks = [];

function getAllTasks() {
  return tasks;
}

function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

function createTask(title) {
  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    done: false,
  };
  tasks.push(newTask);
  return newTask;
}

function updateTask(id, updates) {
  const task = getTaskById(id);
  if (!task) return null;

  if (updates.title !== undefined) {
    task.title = updates.title.trim();
  }
  if (updates.done !== undefined) {
    task.done = updates.done;
  }
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
