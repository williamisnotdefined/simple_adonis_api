'use strict'

const File = use('App/Models/File')
const Task = use('App/Models/Task')

const Helpers = use('Helpers')

class FileController {

	async create({ params, request, response, auth }) {
		try {

			const task = await Task.findOrFail(params.id)
			const filesUploaded = request.file('file', {
				size: '15mb'
			})

			await filesUploaded.moveAll(Helpers.tmpPath('files_path'), file => ({
				name: `${Date.now()}-${auth.user.id}-${file.clientName}`
			}))

			if (!filesUploaded.movedAll()) {
				return {
					success: false,
					errors: filesUploaded.errors()
				}
			}

			// await Promise.all(
			// 	filesUploaded
			// 	.movedList()
			// 	.map(file => File.create({
			// 		task_id: task.id,
			// 		path: file.fileName
			// 	}))
			// )

			await Promise.all(
				filesUploaded
				.movedList()
				.map(file => task.files().create({ path: file.fileName })) // usando o relacionamento do model
			)

			return response.status(200).send({
				success: true
			})

		} catch (err) {
			console.log(err)
			return response.status(500).send({
				success: false,
				message: err
			})
		}
	}

}

module.exports = FileController
