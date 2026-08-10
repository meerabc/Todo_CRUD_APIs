const { pool, setupTable } = require('../db.postgres')

setupTable()

function rowToTask(row){
    return {
        id: row.id,
        title: row.title,
        done: row.done
    }
}

async function findAll({ done, search } = {}){
    let sql = 'SELECT id, title, done FROM tasks WHERE 1=1'
    const params = []

    if (done !== undefined){
        params.push(done)
        sql += ` AND done = $${params.length}`
    }

    if (search !== undefined){
        params.push(`%${search.toLowerCase()}%`)
        sql += ` AND LOWER(title) LIKE $${params.length}`
    }

    sql += ' ORDER BY title'

    const result = await pool.query(sql, params)
    return result.rows.map(rowToTask)
}

async function findById(id){
    const result = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id])
    const row = result.rows[0]
    return row ? rowToTask(row) : null
}

module.exports = { findAll, findById, rowToTask }