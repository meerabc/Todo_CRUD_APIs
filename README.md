# Task API

A small backend API to manage a to-do list. You can create tasks, read them, update them, and delete them (CRUD). Data is stored in memory, so it resets every time the server restarts.

## How to install and run

Requirements: Node.js (tested on v24.13.0)

```
git clone https://github.com/meerabc/Todo_CRUD_APIs.git
cd Todo_CRUD_APIs
npm install
node server.js
```

The server will start on `http://localhost:3000`.

## Endpoints

| Method | Path         | Description                          |
|--------|--------------|---------------------------------------|
| GET    | /            | Basic info about this API             |
| GET    | /health      | Check if the server is running        |
| GET    | /tasks       | List all tasks                        |
| GET    | /tasks/:id   | Get a single task by id               |
| POST   | /tasks       | Create a new task                     |
| PUT    | /tasks/:id   | Update a task's title and/or done     |
| DELETE | /tasks/:id   | Delete a task                         |

## Swagger UI

Once the server is running, open `http://localhost:3000/docs` in your browser to see and test all the `/tasks` endpoints interactively.

![Swagger UI](screenshots/swagger-ui.png)

## Example request

Creating a new task with curl:

```
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"
```

![POST /tasks curl output](screenshots/post-tasks-curl.png)