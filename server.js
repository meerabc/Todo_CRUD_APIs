const express = require('express')
const app = express()
const port = 3000

app.use(express.json())

let tasks = [
    {id: 1, title: 'Complete Express assignment', done: true},
    {id: 2, title: 'Review JavaScript arrays', done: false},
    {id: 3, title: 'Push code to GitHub', done: true},
]

app.get('/', (req, res)=>{
    res.json({name: "Task API", version: "1.0", endpoints: ["/tasks"]})
})

app.get('/health', (req, res)=>{
    res.json({status: "ok"})
})

app.get('/tasks', (req, res)=>{
    res.status(200).json(tasks)
})

app.get('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id)
    const task = tasks.find(task => task.id === id)

    if(!task){
        return res.status(404).json({ "error": `Task ${id} not found` })
    }

    return res.status(200).json(task)
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})


