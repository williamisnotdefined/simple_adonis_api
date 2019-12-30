'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Task = use('App/Models/Task')

/**
* Resourceful controller for interacting with tasks
*/
class TaskController {
    /**
    * Show a list of all tasks.
    * GET tasks
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, auth }) {
        const tasks = Task
            .query()
            .where('user_id', auth.user.id)
            .withCount('files as total_files')
            .fetch()
        /*
        -> não curto isso, tem como filtrar de forma melhor só os campos que a gente quer.
        const tasks = Database.select('title', 'description').from('tasks)
        .where('user_id', auth.user.id)
        */

        return tasks

    }

    /**
    * Create/save a new task.
    * POST tasks
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response, auth }) {

        // falta validações
        const { id: user_id } = auth.user

        const data = request.only(["title", "description"])

        const task = await Task.create({ ...data, user_id });

        return task

    }

    /**
    * Display a single task.
    * GET tasks/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, auth }) {
        const task = await Task.query()
            .where('id', params.id)
            .where('user_id', auth.user.id)
            .first()

        if (!task) {
            return {
                success: false,
                error: "Tarefa não encontrada"
            }
        }

        await task.load('files') // carrega também os arquivos da tarefas

        return {
            success: true,
            task
        }
    }

    /**
    * Update task details.
    * PUT or PATCH tasks/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, auth }) {
        const task = await Task.query()
            .where('id', params.id)
            .where('user_id', auth.user.id)
            .first()

        if (!task) {
            return {
                success: false,
                error: "Tarefa não encontrada"
            }
        }

        const { title, description } = request.all()

        task.title = title
        task.description = description
        await task.save()

        return {
            success: true,
            task
        }
    }

    /**
    * Delete a task with id.
    * DELETE tasks/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, request, auth }) {

        const task = await Task.query()
            .where('id', params.id)
            .where('user_id', auth.user.id)
            .first()

        if (!task) {
            return {
                success: false,
                error: "Tarefa não encontrada"
            }
        }

        await task.delete()

        return {
            success: true,
            message: "Tarefa excluída."
        }

    }
}

module.exports = TaskController
