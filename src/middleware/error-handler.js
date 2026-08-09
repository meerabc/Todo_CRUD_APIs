const { NotFoundError, ValidationError } = require('../errors')

function errorHandler(err, req, res, next){
    if (err instanceof ValidationError){
        return res.status(400).json({ error: err.message })
    }
    if (err instanceof NotFoundError){
        return res.status(404).json({ error: err.message })
    }

    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
}

module.exports = { errorHandler }