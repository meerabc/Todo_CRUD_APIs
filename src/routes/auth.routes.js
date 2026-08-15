const express = require('express')
const authService = require('../services/auth.service')
const { requireAuth } = require('../middleware/auth.guard')
const router = express.Router()

router.post('/auth/signup', async (req, res, next) => {
    try {
        const user = await authService.signUp(req.body ?? {})
        res.status(201).json(user)
    } catch (err) {
        next(err)
    }
})

router.post('/auth/login', async (req, res, next) => {
    try {
        const tokens = await authService.login(req.body ?? {})
        res.status(200).json(tokens)
    } catch (err) {
        next(err)
    }
})

router.post('/auth/logout', requireAuth, async (req, res, next) => {
    try {
        await authService.logout()
        res.status(204).send()
    } catch (err) {
        next(err)
    }
})

module.exports = router