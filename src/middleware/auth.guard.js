const supabase = require('../supabase')
const { AuthError } = require('../errors')

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthError('Access token required')
        }

        const token = authHeader.split(' ')[1]
        
        if (!token) {
            throw new AuthError('Access token required')
        }

        const { data, error } = await supabase.auth.getUser(token)

        if (error || !data.user) {
            throw new AuthError('Invalid or expired token')
        }

        req.user = data.user
        next()
    } catch (err) {
        next(err)
    }
}

module.exports = { requireAuth }