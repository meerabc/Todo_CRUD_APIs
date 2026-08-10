# Task API

A small backend API to manage a to-do list. You can create tasks, read them, update them, and delete them (CRUD). Data is stored in a Postgres database running in Docker, so it survives both app restarts and container restarts.

## How to run (one command)

Requirements: Docker Desktop installed and running.

1. Clone the repo:
   ```
   git clone https://github.com/meerabc/Todo_CRUD_APIs.git
   cd Todo_CRUD_APIs
   ```
2. Copy the example environment file:
   ```
   cp .env.example .env
   ```
3. Start everything:
   ```
   docker compose up
   ```

This starts both the API and a Postgres database together. The API will be available at `http://localhost:3000`. The database table is created automatically, and 3 example tasks are seeded on the first run.

To stop everything:
```
docker compose down
```

## Environment variables

The app reads its database connection from `DATABASE_URL`, set in a `.env` file. `.env.example` shows which variable to set:

```
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

`.env` is gitignored and never committed, since it can contain real secrets. Note that inside `docker compose`, the app actually connects using the service name `db` instead of `localhost`, this is set automatically in `compose.yaml`. The `.env` file matters if you ever want to run the app directly on your machine (outside Docker) against a locally running Postgres.

## Project structure

The code is organized in layers:
- `src/routes/` : handles HTTP requests and responses, no business logic
- `src/services/` : validation and business rules
- `src/repositories/` : the only place that talks to the database (SQL)
- `src/middleware/error-handler.js` : turns thrown errors into HTTP status codes

This is the third storage engine this API has used (in-memory, then SQLite, now Postgres), and each time only the repository file changed. Routes and services stayed the same, which is the whole point of keeping storage in its own layer.

## Endpoints

| Method | Path         | Description                          |
|--------|--------------|---------------------------------------|
| GET    | /            | Basic info about this API             |
| GET    | /health      | Check if the server is running        |
| GET    | /tasks       | List all tasks (supports optional filters, see below) |
| GET    | /tasks/:id   | Get a single task by id               |
| POST   | /tasks       | Create a new task                     |
| PUT    | /tasks/:id   | Update a task's title and/or done     |
| DELETE | /tasks/:id   | Delete a task                         |

## Extras (optional, beyond the required endpoints)

| Method | Path                  | Description                                  |
|--------|-----------------------|-----------------------------------------------|
| GET    | /tasks?done=true       | Only tasks that are marked done               |
| GET    | /tasks?done=false      | Only tasks that are not done                  |
| GET    | /tasks?search=milk     | Only tasks whose title contains "milk"        |
| GET    | /stats                | Task counts: total, done, open                |
| POST   | /reset                | Restore the original 3 example tasks          |

## Swagger UI

Once the stack is running, open `http://localhost:3000/docs` in your browser to see and test all the `/tasks` endpoints interactively.

![Swagger UI](screenshots/swagger-ui.png)

## Example request

Creating a new task with curl:

```
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"
```

![POST /tasks curl output](screenshots/post-tasks-curl.png)

## Database

Data is stored in Postgres, running as its own container, not a file on disk. A named Docker volume (`taskdata`) keeps the actual data outside the container, so it survives even if the container is removed and recreated.

Here is the `tasks` table, viewed directly with `psql` inside the running container:

```
docker compose exec db psql -U postgres -d tasks -c "SELECT * FROM tasks"
```

![Postgres data](screenshots/postgres-data.png)

## Persistence proof

To prove data survives a full restart, not just an app restart, I did this:

1. Created a new task through the API.
2. Ran `docker compose down` (this removes the containers completely, not just stops them).
3. Ran `docker compose up` again.
4. Called `GET /tasks` again.

The task I created was still there. This works because the data lives in the `taskdata` volume, which is separate from the containers themselves. Removing and recreating the containers does not touch the volume, so nothing is lost.