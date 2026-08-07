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

Once the server is running, open `http://localhost:3000/docs` in your browser to see and test all the `/tasks` endpoints interactively.

![Swagger UI](screenshots/swagger-ui.png)

## Example request

Creating a new task with curl:

```
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d "{\"title\":\"Buy milk\"}"
```

![POST /tasks curl output](screenshots/post-tasks-curl.png)

## The mortality experiment

I added a few tasks, restarted the server, and checked GET /tasks again. I noticed that the new tasks were gone, leaving only the original 3. This happens because tasks lives only in memory (a normal JavaScript array), not on disk, so restarting the server wipes it and starts fresh from the code every time.

## AI vs me

### My prompt

"I want you to create simple ToDo CRUD APIs in Node.js : 
get /tasks : to fetch all the tasks 
  return 200 on successful get 
get /tasks/:id : to fetch a task by its id 
  return 200 on successful fetch and 404 if task with that id doesn't exist 
post : to post a new task 
  return 201 , with created task, if task successfully created and 400 in case of bad request (title missing or empty) 
put: to update an existing task 
  return 200 on successful updation with updated task , else return 404 if task with that id doesnt exist and 400 if case of bad request(empty body , or empty title field (not in case of missing title field in case of done attribute updation)) 
delete: to delete a task by id 
  return 204 on successful deletion and 404 if task with that id doesnt exist

in case of 400,404 etc errors, also send clear error message in response.do proper validation of request body for post and put , as specified.

Each task object contains id, title and done status which is initially set to false.
provide the code , guide me on project setup, necessary files/folder creations and server execution."

I ran the AI's version and tested all 5 endpoints with curl, the same way I tested my own code. Every response matched what I asked for: 201 on create, 200 on get/update, 204 on delete, 404 when a task id doesn't exist, and 400 with a clear error message when the body is bad. I did not find anything broken.

### What the AI did better

The AI split the code into separate files: routes, controllers, and models. My code is just one `server.js` file. For a small project like this both work fine, but the AI's structure would make it easier to add more features later without one huge file.

It also checked more things before accepting a request. For example, on PUT it checks that `done` is actually a boolean, not just any value. My own code does not check this, so I could send `{"done": "yes"}` and it would still get saved. The AI also has a separate handler for badly formatted JSON in the request body, so it returns a clean 400 instead of crashing.

I understand how its code works. It uses the same basic ideas as mine (find task by id, check if it exists, validate fields), just spread across more files.

### What it got wrong or ignored

Nothing broke in my testing. All 5 endpoints returned the exact status codes I asked for, in every case I tried, including the error cases.

### What my prompt forgot to specify

I never said how task ids should be generated. My own code uses simple numbers like 1, 2, 3. The AI decided on its own to use `crypto.randomUUID()`, so its ids look like `e8d00d36-efdf-47b2-9323-78525f55e529`. This is a real difference someone using the API would notice right away, and I only got it because I did not specify it.

It also added things I did not ask for, like letting the port be set with an environment variable (`PORT=4000 npm start`) and a `npm run dev` script that auto restarts the server on file changes.

### The rematch

For the second try, I added one line to my prompt asking for numeric, auto incrementing ids starting from 1, instead of leaving id generation up to the AI. That was the one thing I changed.