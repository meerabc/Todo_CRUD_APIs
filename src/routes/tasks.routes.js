const express = require('express')
const service = require('../services/tasks.service')
const router = express.Router()

router.get('/tasks', async (req, res, next)=>{
    try {
        const tasks = await service.listTasks({ done: req.query.done, search: req.query.search })
        res.status(200).json(tasks)
    } catch (err) {
        next(err)
    }
})

router.get('/tasks/:id', async (req, res, next)=>{
    try {
        const task = await service.getTask(Number(req.params.id))
        res.status(200).json(task)
    } catch (err) {
        next(err)
    }
})

router.post('/tasks', async (req, res, next)=>{
    try {
        const task = await service.createTask(req.body ?? {})
        res.status(201).json(task)
    } catch (err) {
        next(err)
    }
})

router.put('/tasks/:id', async (req, res, next)=>{
    try {
        const task = await service.updateTask(Number(req.params.id), req.body ?? {})
        res.status(200).json(task)
    } catch (err) {
        next(err)
    }
})

router.delete('/tasks/:id', async (req, res, next)=>{
    try {
        await service.deleteTask(Number(req.params.id))
        res.status(204).send()
    } catch (err) {
        next(err)
    }
})

router.get('/stats', async (req, res, next)=>{
    try {
        res.status(200).json(await service.getStats())
    } catch (err) {
        next(err)
    }
})

router.post('/reset', async (req, res, next)=>{
    try {
        const tasks = await service.resetTasks()
        res.status(200).json({ message: 'Tasks reset', tasks })
    } catch (err) {
        next(err)
    }
})

module.exports = router