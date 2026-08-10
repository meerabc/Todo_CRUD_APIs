const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

const SEED_TASKS = [
    { title: 'Complete Express assignment', done: true },
    { title: 'Review JavaScript arrays', done: false },
    { title: 'Push code to GitHub', done: true },
]

async function setupTable(){
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            done BOOLEAN NOT NULL DEFAULT false
        )
    `)

    const result = await pool.query('SELECT COUNT(*) FROM tasks')
    const count = Number(result.rows[0].count)

    if (count === 0){
        for (const task of SEED_TASKS){
            await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', [task.title, task.done])
        }
    }
}

module.exports = { pool, setupTable }