const supabase = require('../supabase')
const { ValidationError, AuthError } = require('../errors')

async function signUp({ email, password }) {
    if (email === undefined || password === undefined) {
        throw new ValidationError('email and password are required')
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
        throw new ValidationError(error.message)
    }

    return data.user
}

async function login({ email, password }) {
    if (email === undefined || password === undefined) {
        throw new ValidationError('email and password are required')
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        throw new AuthError('Invalid login credentials')
    }

    return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
    }
}

async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        throw error
    }
}

module.exports = { signUp, login, logout }