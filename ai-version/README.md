# ToDo CRUD API

Simple in-memory ToDo API built with Node.js and Express.

## Project structure

```
todo-api/
├── index.js                     # server entry point
├── package.json
├── routes/
│   └── tasks.routes.js          # maps HTTP verbs+paths to controller functions
├── controllers/
│   └── tasks.controller.js      # request handling + validation logic
└── models/
    └── task.model.js            # in-memory data store + CRUD helpers
```

## Setup

1. Make sure Node.js (v18+) is installed: `node -v`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3000`.

   For auto-restart on file changes during development:
   ```bash
   npm run dev
   ```

You can change the port with an environment variable: `PORT=4000 npm start`.

## Task object shape

```json
{
  "id": "uuid-string",
  "title": "string",
  "done": false
}
```

`id` is generated automatically. `done` defaults to `false` when a task is created.

## Endpoints

| Method | Path         | Description          | Success | Errors |
|--------|--------------|-----------------------|---------|--------|
| GET    | /tasks       | List all tasks        | 200     | -      |
| GET    | /tasks/:id   | Get a task by id      | 200     | 404 if not found |
| POST   | /tasks       | Create a task          | 201     | 400 if `title` missing/empty |
| PUT    | /tasks/:id   | Update a task          | 200     | 404 if not found, 400 if body empty/invalid |
| DELETE | /tasks/:id   | Delete a task          | 204     | 404 if not found |

All error responses have the shape `{ "error": "message" }`.

### Examples (curl)

Create a task:
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'
```

Get all tasks:
```bash
curl http://localhost:3000/tasks
```

Get one task:
```bash
curl http://localhost:3000/tasks/<id>
```

Update a task (title and/or done):
```bash
curl -X PUT http://localhost:3000/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

Delete a task:
```bash
curl -X DELETE http://localhost:3000/tasks/<id>
```

## Notes

- Data is stored **in memory** — it resets whenever the server restarts. Swap out `models/task.model.js` for a real database later without touching the routes or controllers.
- On `PUT`, you can send just `{"done": true}` to toggle completion without re-sending the title, or just `{"title": "..."}` to rename without touching `done`. Sending an empty body `{}`, or a `title` that's empty/whitespace-only, returns `400`.
- On `POST`, a missing or empty `title` returns **400** (Bad Request) rather than 404, since 404 is reserved for "resource not found" — e.g. `GET /tasks/:id` with an id that doesn't exist.


