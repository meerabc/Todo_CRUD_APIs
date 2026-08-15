const express = require('express')
const { requireAuth } = require('../middleware/auth.guard')
const router = express.Router()

router.get('/protected/profile', requireAuth, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at
    })
})

router.get('/protected/dashboard', requireAuth, (req, res) => {
    res.status(200).json({
        message: 'Dashboard access granted',
        user_email: req.user.email
    })
})

module.exports = router