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

async function create({ title }){
    const result = await pool.query(
        'INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING id, title, done',
        [title]
    )
    return rowToTask(result.rows[0])
}

async function update(id, changes){
    const existing = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id])
    const row = existing.rows[0]
    if (!row) return null

    const nextTitle = changes.title !== undefined ? changes.title : row.title
    const nextDone = changes.done !== undefined ? changes.done : row.done

    const result = await pool.query(
        'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done',
        [nextTitle, nextDone, id]
    )
    return rowToTask(result.rows[0])
}

async function remove(id){
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id])
    return result.rowCount > 0
}

async function getStats(){
    const totalResult = await pool.query('SELECT COUNT(*) FROM tasks')
    const doneResult = await pool.query('SELECT COUNT(*) FROM tasks WHERE done = true')

    const total = Number(totalResult.rows[0].count)
    const done = Number(doneResult.rows[0].count)
    const open = total - done

    return { total, done, open }
}

async function reset(){
    await pool.query('DELETE FROM tasks')
    await setupTable()
    return await findAll({})
}

module.exports = { findAll, findById, create, update, remove, getStats, reset, rowToTask }