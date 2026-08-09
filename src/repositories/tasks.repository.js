const db = require('../db')

function rowToTask(row){
    return {
        id: row.id,
        title: row.title,
        done: Boolean(row.done)
    }
}

const SEED_TASKS = [
    { id: 1, title: 'Complete Express assignment', done: true },
    { id: 2, title: 'Review JavaScript arrays', done: false },
    { id: 3, title: 'Push code to GitHub', done: true },
]

function seedIfEmpty(){
    const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count
    if (count === 0){
        const insertTask = db.prepare('INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)')
        for (const task of SEED_TASKS){
            insertTask.run(task.id, task.title, task.done ? 1 : 0)
        }
    }
}

seedIfEmpty()

function findAll({ done, search } = {}){
    let sql = 'SELECT id, title, done FROM tasks WHERE 1=1'
    const params = []

    if (done !== undefined){
        sql += ' AND done = ?'
        params.push(done ? 1 : 0)
    }

    if (search !== undefined){
        sql += ' AND LOWER(title) LIKE ?'
        params.push(`%${search.toLowerCase()}%`)
    }

    sql += ' ORDER BY title COLLATE NOCASE'

    const rows = db.prepare(sql).all(...params)
    return rows.map(rowToTask)
}

function findById(id){
    const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id)
    return row ? rowToTask(row) : null
}

function getStats(){
    const total = db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count
    const done = db.prepare('SELECT COUNT(*) AS count FROM tasks WHERE done = 1').get().count
    const open = total - done
    return { total, done, open }
}

function create({ title }){
    const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(title)
    const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(result.lastInsertRowid)
    return rowToTask(row)
}

function update(id, changes){
    const row = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id)
    if (!row) return null

    const nextTitle = changes.title !== undefined ? changes.title : row.title
    const nextDone = changes.done !== undefined ? (changes.done ? 1 : 0) : row.done

    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(nextTitle, nextDone, id)

    const updatedRow = db.prepare('SELECT id, title, done FROM tasks WHERE id = ?').get(id)
    return rowToTask(updatedRow)
}

function remove(id){
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    return result.changes > 0
}

function reset(){
    db.prepare('DELETE FROM tasks').run()
    seedIfEmpty()
    return findAll()
}

module.exports = { findAll, findById, getStats, create, update, remove, reset }