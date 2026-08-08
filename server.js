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

if (taskCount.count === 0) {
    const insertTask = db.prepare('INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)')

    insertTask.run(1, 'Complete Express assignment', 1)
    insertTask.run(2, 'Review JavaScript arrays', 0)
    insertTask.run(3, 'Push code to GitHub', 1)
}

const initialTasks = [
    {id: 1, title: 'Complete Express assignment', done: true},
    {id: 2, title: 'Review JavaScript arrays', done: false},
    {id: 3, title: 'Push code to GitHub', done: true},
]

let tasks = [...initialTasks]

app.get('/', (req, res)=>{
    res.json({name: "Task API", version: "1.0", endpoints: ["/tasks"]})
})

app.get('/health', (req, res)=>{
    res.json({status: "ok"})
})

app.get('/tasks', (req, res)=>{

    let {search, done} = req.query
    let result = tasks

    if(done !== undefined){
        const isDone = done === 'true' 
        result = result.filter(task => task.done === isDone)
    }

    if(search !== undefined){
        search = search.toLowerCase().trim()
        result = result.filter(task => task.title.toLowerCase().includes(search))
    }
    res.status(200).json(result)
})

app.get('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    const task = tasks.find(task => task.id === id)

    if(!task){
        return res.status(404).json({error: `Task ${id} not found` })
    }

    return res.status(200).json(task)
})

app.get('/stats', (req, res)=>{
    const total = tasks.length
    const done = tasks.filter(task => task.done === true).length
    const open = total - done

    res.status(200).json({total, done, open})
})

app.post('/tasks', (req, res)=>{
    let {title} = req.body

    if(title === undefined){
        return res.status(400).json({error: 'title is mandatory'})
    }

    title = title.trim()

    if (title.length === 0){
        return res.status(400).json({error: 'title cannot be empty'})
    }

    const id = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1
    const task = {id, title, done: false}   
    tasks.push(task)

    res.status(201).json(task)

})

app.post('/reset', (req, res)=>{
    tasks = [...initialTasks]
    res.status(200).json({tasks})
})

app.put('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    let {title, done} = req.body

    const task = tasks.find(task => task.id === id)

    if(!task){
        return res.status(404).json({error: `Task ${id} does not exist`})
    }


    if(title === undefined && done === undefined){
        return res.status(400).json({error: 'invalid body'})
    }

    if(title !== undefined){
        title = title.trim()
        if(title.length === 0){
            return res.status(400).json({error: 'title cannot be empty'})
        }
        task.title = title
    }
    if(done !== undefined){
        task.done = done
    }

    return res.status(200).json(task) 
})

app.delete('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    const index = tasks.findIndex(task => task.id === id)

    if(index === -1){
        return res.status(404).json({error: `Task ${id} does not exist`})
    }
    tasks.splice(index, 1)

    return res.status(204).send()
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})


