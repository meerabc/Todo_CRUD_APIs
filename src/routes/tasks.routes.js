const express = require('express')
const service = require('../services/tasks.service')
const router = express.Router()

router.get('/tasks', (req, res, next)=>{
    try {
        const tasks = service.listTasks({ done: req.query.done, search: req.query.search })
        res.status(200).json(tasks)
    } catch (err) {
        next(err)
    }
})

router.get('/tasks/:id', (req, res, next)=>{
    try {
        const task = service.getTask(Number(req.params.id))
        res.status(200).json(task)
    } catch (err) {
        next(err)
    }
})

router.post('/tasks', (req, res, next)=>{
    try {
        const task = service.createTask(req.body ?? {})
        res.status(201).json(task)
    } catch (err) {
        next(err)
    }
})

router.put('/tasks/:id', (req, res, next)=>{
    try {
        const task = service.updateTask(Number(req.params.id), req.body ?? {})
        res.status(200).json(task)
    } catch (err) {
        next(err)
    }
})

router.delete('/tasks/:id', (req, res, next)=>{
    try {
        service.deleteTask(Number(req.params.id))
        res.status(204).send()
    } catch (err) {
        next(err)
    }
})

router.get('/stats', (req, res, next)=>{
    try {
        res.status(200).json(service.getStats())
    } catch (err) {
        next(err)
    }
})

router.post('/reset', (req, res, next)=>{
    try {
        const tasks = service.resetTasks()
        res.status(200).json({ message: 'Tasks reset', tasks })
    } catch (err) {
        next(err)
    }
})

module.exports = router