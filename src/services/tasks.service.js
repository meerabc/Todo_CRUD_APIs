const repo = require('../repositories/tasks.repository.postgres')
const { NotFoundError, ValidationError } = require('../errors')

async function listTasks({ done, search } = {}){
    let doneFilter
    if (done !== undefined){
        if (done !== 'true' && done !== 'false'){
            throw new ValidationError('done must be true or false')
        }
        doneFilter = done === 'true'
    }

    let searchFilter
    if (search !== undefined){
        const word = String(search).trim()
        if (word === ''){
            throw new ValidationError('search must not be empty')
        }
        searchFilter = word
    }

    return await repo.findAll({ done: doneFilter, search: searchFilter })
}

async function getTask(id){
    const task = await repo.findById(id)
    if (!task){
        throw new NotFoundError(`Task ${id} not found`)
    }
    return task
}

async function createTask(body = {}){
    const { title } = body

    if (title === undefined){
        throw new ValidationError('title is mandatory')
    }
    if (typeof title !== 'string'){
        throw new ValidationError('title must be a string')
    }
    const trimmedTitle = title.trim()
    if (trimmedTitle.length === 0){
        throw new ValidationError('title cannot be empty')
    }

    return await repo.create({ title: trimmedTitle })
}

async function updateTask(id, body = {}){
    const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title')
    const hasDone = Object.prototype.hasOwnProperty.call(body, 'done')

    if (!hasTitle && !hasDone){
        throw new ValidationError('invalid body')
    }

    const changes = {}

    if (hasTitle){
        if (typeof body.title !== 'string'){
            throw new ValidationError('title must be a string')
        }
        const trimmedTitle = body.title.trim()
        if (trimmedTitle.length === 0){
            throw new ValidationError('title cannot be empty')
        }
        changes.title = trimmedTitle
    }

    if (hasDone){
        if (typeof body.done !== 'boolean'){
            throw new ValidationError('done must be a boolean')
        }
        changes.done = body.done
    }

    const updated = await repo.update(id, changes)
    if (!updated){
        throw new NotFoundError(`Task ${id} does not exist`)
    }
    return updated
}

async function deleteTask(id){
    const removed = await repo.remove(id)
    if (!removed){
        throw new NotFoundError(`Task ${id} does not exist`)
    }
}

async function getStats(){
    return await repo.getStats()
}

async function resetTasks(){
    return await repo.reset()
}

module.exports = {
    listTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getStats,
    resetTasks,
}