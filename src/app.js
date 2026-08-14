const express = require('express')
const swaggerUi = require('swagger-ui-express')
const openapiDocument = require('../openapi.json')
const metaRoutes = require('./routes/meta.routes')
const tasksRoutes = require('./routes/tasks.routes')
const authRoutes = require('./routes/auth.routes')
const { errorHandler } = require('./middleware/error-handler')

function createApp(){
    const app = express()

    app.use(express.json())
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument))

    app.use('/', metaRoutes)
    app.use('/', tasksRoutes)
    app.use('/', authRoutes)

    app.use(errorHandler)

    return app
}

module.exports = { createApp }