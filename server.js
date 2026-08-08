const express = require('express')
const Database = require('better-sqlite3')
const swaggerUi = require('swagger-ui-express')
const openapiDocument = require('./openapi.json')

const app = express()
const port = 3000

app.use(express.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument))

const db = new Database('tasks.db')

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks(
       id INTEGER PRIMARY KEY,
       title TEXT NOT NULL,
       done INTEGER NOT NULL DEFAULT 0
    ) `
)

const taskCount = db.prepare(`SELECT COUNT(*) AS count FROM tasks`).get()

function seedTasks(){
    const insertTask = db.prepare('INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)')
    insertTask.run(1, 'Complete Express assignment', 1)
    insertTask.run(2, 'Review JavaScript arrays', 0)
    insertTask.run(3, 'Push code to GitHub', 1)
}

if (taskCount.count === 0) {
    seedTasks()
}

function rowToTask(row){
    return {
        id: row.id,
        title: row.title,
        done: Boolean(row.done)
    }
}

app.get('/', (req, res)=>{
    res.json({name: "Task API", version: "1.0", endpoints: ["/tasks", "/stats", "/reset"]})
})

app.get('/health', (req, res)=>{
    res.json({status: "ok"})
})

app.get('/tasks', (req, res)=>{
    const { done, search } = req.query

    let sql = 'SELECT id, title, done FROM tasks WHERE 1=1'
    const params = []

    if (done !== undefined){
        const isDone = done === 'true' ? 1 : 0
        sql += ' AND done = ?'
        params.push(isDone)
    }

    if (search !== undefined){
        const cleanSearch = search.trim().toLowerCase()
        sql += ' AND LOWER(title) LIKE ?'
        params.push(`%${cleanSearch}%`)
    }

    sql += ' ORDER BY title COLLATE NOCASE'

    const rows = db.prepare(sql).all(...params)
    res.status(200).json(rows.map(rowToTask))
})

app.get('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id)

    if(!row){
        return res.status(404).json({error: `Task ${id} not found` })
    }

    return res.status(200).json(rowToTask(row))
})

app.get('/stats', (req, res)=>{
    const total = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count
    const done = db.prepare('SELECT COUNT(*) AS count FROM tasks WHERE done = 1').get().count
    const open = total - done

    res.status(200).json({total, done, open})
})

app.post('/tasks', (req, res)=>{
    let {title} = req.body

    if(title === undefined){
        return res.status(400).json({error: 'title is mandatory'})
    }

    if(typeof title !== 'string'){
        return res.status(400).json({error: 'title must be a string'})
    }

    title = title.trim()

    if (title.length === 0){
        return res.status(400).json({error: 'title cannot be empty'})
    }

    const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(title)
    const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(result.lastInsertRowid)

    res.status(201).json(rowToTask(row))
})

app.post('/reset', (req, res)=>{
    db.prepare('DELETE FROM tasks').run()
    seedTasks()

    const rows = db.prepare('SELECT id, title, done FROM tasks').all()
    res.status(200).json({ message: 'Tasks reset', tasks: rows.map(rowToTask) })
})

app.put('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    let {title, done} = req.body

    const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id)

    if(!row){
        return res.status(404).json({error: `Task ${id} does not exist`})
    }

    if(title === undefined && done === undefined){
        return res.status(400).json({error: 'invalid body'})
    }

    let nextTitle = row.title
    let nextDone = row.done

    if(title !== undefined){
        if(typeof title !== 'string'){
            return res.status(400).json({error: 'title must be a string'})
        }
        title = title.trim()
        if(title.length === 0){
            return res.status(400).json({error: 'title cannot be empty'})
        }
        nextTitle = title
    }

    if(done !== undefined){
        if(typeof done !== 'boolean'){
            return res.status(400).json({error: 'done must be a boolean'})
        }
        nextDone = done ? 1 : 0
    }

    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(nextTitle, nextDone, id)

    const updatedRow = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id)
    return res.status(200).json(rowToTask(updatedRow))
})

app.delete('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)

    if(result.changes === 0){
        return res.status(404).json({error: `Task ${id} does not exist`})
    }

    return res.status(204).send()
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})


