# Task API with Supabase Authentication

A robust backend API to manage a to-do list, featuring complete user authentication (Sign Up, Log In, Log Out) and protected routes backed by Supabase Auth as the Identity Provider.

Data is stored in a Postgres database running in Docker, ensuring persistence across app and container restarts. The application follows a clean layered architecture with reusable authentication middleware and interactive Swagger UI documentation.

## How to run (one command)

Requirements: Docker Desktop installed and running.

1. Clone the repo:
   ```bash
   git clone https://github.com/meerabc/Todo_CRUD_APIs.git
   cd Todo_CRUD_APIs
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Add your Supabase credentials (`SUPABASE_URL` and `SUPABASE_KEY`) to `.env`.

4. Start everything:
   ```bash
   docker compose up --build
   ```

This starts both the API and a Postgres database together. The API will be available at `http://localhost:3000`. The database table is created automatically, and 3 example tasks are seeded on the first run.

To stop everything:
```bash
docker compose down
```

## Environment variables

The app reads configuration from a `.env` file. `.env.example` shows the required variables:

```
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

`.env` is gitignored and never committed to protect secrets. Inside `docker compose`, the app connects to the database using the service name `db` (configured automatically in `compose.yaml`) and passes through the Supabase credentials.

## Project structure

The code is organized in modular layers:

- `src/routes/`: handles HTTP requests and responses, keeping the HTTP layer thin
- `src/services/`: validation and business rules (including Supabase Auth integration)
- `src/repositories/`: the only place that talks to the database (SQL)
- `src/middleware/auth.guard.js`: reusable token verification middleware (`requireAuth`) that validates JWTs with Supabase before granting access
- `src/middleware/error-handler.js`: centralized error handler turning `ValidationError` (400), `AuthError` (401), and `NotFoundError` (404) into standard JSON responses
- `src/supabase.js`: initializes and exports the Supabase client

## Endpoints & Authentication

### Authentication & Protected Routes

| Method | Path | Auth Header Required | Description |
|--------|------|----------------------|-------------|
| POST | `/auth/signup` | None | Register a new user account |
| POST | `/auth/login` | None | Authenticate credentials and return JWT access/refresh tokens |
| POST | `/auth/logout` | `Authorization: Bearer <token>` | End user session via Supabase |
| GET | `/public/info` | None | Publicly accessible information |
| GET | `/protected/profile` | `Authorization: Bearer <token>` | Verified user profile metadata |
| GET | `/protected/dashboard` | `Authorization: Bearer <token>` | Additional protected route proving middleware reuse |

### Task Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Basic info about this API |
| GET | `/health` | Check if the server is running |
| GET | `/tasks` | List all tasks (supports optional filters, see below) |
| GET | `/tasks/:id` | Get a single task by id |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task's title and/or done |
| DELETE | `/tasks/:id` | Delete a task |

### Extras (optional, beyond the required endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks?done=true` | Only tasks that are marked done |
| GET | `/tasks?done=false` | Only tasks that are not done |
| GET | `/tasks?search=milk` | Only tasks whose title contains "milk" |
| GET | `/stats` | Task counts: total, done, open |
| POST | `/reset` | Restore the original 3 example tasks |

### Swagger UI

Interactive API documentation is available at `http://localhost:3000/docs`. Protected endpoints feature Bearer authentication (click the green **Authorize** button and paste your JWT `access_token` to test protected routes directly in the browser).

![Swagger UI](screenshots/swagger-ui.png)

## Example requests

### Authentication & Profile Flow (curl)

1. Sign Up:
   ```bash
   curl -i -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"intern@flyrank.com\",\"password\":\"password123\"}"
   ```

2. Log In:
   ```bash
   curl -i -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"intern@flyrank.com\",\"password\":\"password123\"}"
   ```

3. Access Protected Route:
   ```bash
   curl -i http://localhost:3000/protected/profile \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
   ```

### Task CRUD Request

Creating a new task:
```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Buy milk\"}"
```
![POST /tasks curl output](screenshots/post-tasks-curl.png)

## Database

Data is stored in Postgres, running as its own container, not a file on disk. A named Docker volume (`taskdata`) keeps the actual data outside the container, so it survives even if the container is removed and recreated.

Here is the `tasks` table, viewed directly with `psql` inside the running container:

```bash
docker compose exec db psql -U postgres -d tasks -c "SELECT * FROM tasks"
```

The `db` service has a Docker healthcheck (`pg_isready`), and `api` waits for it to report healthy before starting. Without this, the app can start before Postgres is ready to accept connections and crash with a connection error, especially on a completely fresh volume.

![Postgres data](screenshots/postgres-data.png)

### Persistence proof

To prove data survives a full restart, not just an app restart, I did this:

1. Created a new task through the API.
2. Ran `docker compose down` (this removes the containers completely, not just stops them).
3. Ran `docker compose up` again.
4. Called `GET /tasks` again.

The task I created was still there. This works because the data lives in the `taskdata` volume, which is separate from the containers themselves. Removing and recreating the containers does not touch the volume, so nothing is lost.