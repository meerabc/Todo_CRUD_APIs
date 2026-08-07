const express = require('express');
const tasksRouter = require('./routes/tasks.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Handle malformed JSON bodies gracefully (instead of a raw 500 crash)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  next(err);
});

app.use('/tasks', tasksRouter);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.method} ${req.originalUrl}' not found.` });
});

// Generic error handler (safety net)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`ToDo API server running on http://localhost:${PORT}`);
});
