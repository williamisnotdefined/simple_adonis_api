'use strict'

const User = use('App/Models/User')
const { validateAll } = use('Validator')

class UserController {

	async create({ request, response }) {
		try {

			const validations = await validateAll(request.all(), {
				username: 'required|min:5|unique:users',
				email: 'required|email|unique:users',
				password: 'required|min:6',
			}, {
				'username.required': 'É necessário informar o nome.',
				'username.unique': 'Usuário já cadastrado.',
				'username.min': 'O nome deve ter mais que 5 caracteres.',

				'email.required': 'É necessário informar o e-mail.',
				'email.email': 'E-mail inválido.',
				'email.unique': 'E-mail já cadastrado.',

				'password.required': 'É necessário informar o password.',
				'password.min': 'O password deve ter mais que 5 caracteres.',
			})

			if (validations.fails()) {
				return response.status(401).send({
					success: false,
					message: validations.messages()
				})
			}

			const data = request.only([ "username", "email", "password" ])
			const user = await User.create(data)

			return {
				success: true,
				user
			}
		} catch (err) {
			return response.status(500).send({
				success: false,
				message: `Error: ${err.message}`
			})
		}
	}

	async login({ request, response, auth }) {
		try {
			const { email, password } = request.all()

			const validateToken = await auth.attempt(email, password)

			return validateToken
		} catch (err) {
			return response.status(500).send({
				success: false,
				message: `Error: ${err.message}`
			})
		}
	}

}

module.exports = UserController
