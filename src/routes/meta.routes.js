const express = require('express')
const router = express.Router()

router.get('/', (req, res)=>{
    res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks", "/stats", "/reset", "/health", "/auth", "/public", "/protected"] })
})

router.get('/health', (req, res)=>{
    res.json({ status: "ok" })
})

router.get('/public/info', (req, res) => {
    res.status(200).json({ message: "Welcome stranger! This info is public." })
})

module.exports = router