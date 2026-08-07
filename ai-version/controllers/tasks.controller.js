const taskModel = require('../models/task.model');

// GET /tasks
function getAllTasks(req, res) {
  const tasks = taskModel.getAllTasks();
  return res.status(200).json(tasks);
}

// GET /tasks/:id
function getTaskById(req, res) {
  const { id } = req.params;
  const task = taskModel.getTaskById(id);

  if (!task) {
    return res.status(404).json({ error: `Task with id '${id}' not found.` });
  }

  return res.status(200).json(task);
}

// POST /tasks
function createTask(req, res) {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Request body must be a valid JSON object.' });
  }

  const { title } = body;

  if (title === undefined || title === null) {
    return res.status(400).json({ error: "'title' is required." });
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: "'title' must be a non-empty string." });
  }

  const newTask = taskModel.createTask(title);
  return res.status(201).json(newTask);
}

// PUT /tasks/:id
function updateTask(req, res) {
  const { id } = req.params;
  const body = req.body;

  const existingTask = taskModel.getTaskById(id);
  if (!existingTask) {
    return res.status(404).json({ error: `Task with id '${id}' not found.` });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'Request body cannot be empty.' });
  }

  const { title, done } = body;

  // title is optional on update, but if present it must be a non-empty string
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: "'title' cannot be empty." });
    }
  }

  // done is optional on update, but if present it must be a boolean
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: "'done' must be a boolean." });
  }

  // At least one recognized field must be present
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Request body must include at least 'title' or 'done'." });
  }

  const updatedTask = taskModel.updateTask(id, { title, done });
  return res.status(200).json(updatedTask);
}

// DELETE /tasks/:id
function deleteTask(req, res) {
  const { id } = req.params;
  const wasDeleted = taskModel.deleteTask(id);

  if (!wasDeleted) {
    return res.status(404).json({ error: `Task with id '${id}' not found.` });
  }

  return res.status(204).send();
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
