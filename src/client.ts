import * as Express from 'express'
import { Command } from './command'
import nacl from 'tweetnacl'
import fetch from 'node-fetch'
import { apiUrl } from './api'
import { CommandOption } from './command-types'
import chalk from 'chalk'
import indentString from 'indent-string'

export type GougeClientOptions = {
	/** Your Discord application's *Public Key* */
	key: string
	/** Your Discord application's *Client Secret* */
	secret: string
	/** Your Discord bot's *Token* */
	token: string
	/** Your Discord application's *Client ID* */
	id: string
	/** By setting this variable, you put the Gouge client into ***TESTING MODE***.
	 * All global commands will instead become guild-only commands for this
	 * guild ID. Global commands update slowly, while guild commands update
	 * instantly. ***DON'T*** set this variable during production!
	 */
	testGuildId?: string
}
/**
 * @class GougeClient
 * This is the core client.
 */
export class GougeClient {
	private app: Express.Application
	/** Your Discord application's *Public Key* */
	key: string
	/** Your Discord application's *Client Secret* */
	secret: string
	/** Your Discord bot's *Token* */
	token: string
	/** Your Discord application's *Client ID* */
	id: string

	private testGuildId?: string
	private pendingCommands: Command<any, any>[]

	/** A map of all successfully registered global commands.
	 * This is populated by [[GougeClient.add]]
	 */
	commands: {
		[id: string]: Command<any, any>
	}

	/** Nesting maps of all successfully registered guild-specific commands.
	 * This is populated by [[GougeClient.addGuild]]
	 */
	guildCommands: {
		[guildId: string]: {
			[id: string]: Command<any, any>
		}
	}

	constructor(options: GougeClientOptions) {
		this.key = options.key
		this.secret = options.secret
		this.token = options.token
		this.id = options.id
		this.testGuildId = options.testGuildId
		this.app = Express.default()
		this.commands = {}
		this.guildCommands = {}
		this.pendingCommands = []

		this.app.use(
			Express.json({
				verify: (req, res, buf) => {
					;(req as any).rawBody = buf
				},
			})
		)
		this.app.use((req, res, next) => {
			const signature = req.get('X-Signature-Ed25519')
			const timestamp = req.get('X-Signature-Timestamp')
			if (!signature || !timestamp)
				throw new Error('Incorrect security headers')
			const body = (req as any).rawBody
			const isVerified = nacl.sign.detached.verify(
				Buffer.from(timestamp + body),
				Buffer.from(signature, 'hex'),
				Buffer.from(this.key, 'hex')
			)
			if (!isVerified) {
				return res.status(401).end('invalid request signature')
			}
			next()
		})

		this.app.post('/', async (req, res) => {
			if (req.body.type == 1) {
				return res.status(200).send({ type: 1 })
			}

			const token = req.body.token
			const id = req.body.data.id

			console.log(JSON.stringify(req.body, null, 2))
			console.log(`/interactions/${req.body.id}/${token}/callback`)
			// find the command
			let command: Command<any, any> | undefined =
				this.commands[id] ||
				(this.guildCommands[req.body.guild_id]
					? this.guildCommands[req.body.guild_id][id]
					: undefined)

			try {
				await command?.doHandle(this, req.body)
			} catch (err) {
				console.error('Error processing interaction')
				console.error(err.message)
			}
		})
	}

	/**
	 * Start the gouge client listening for incoming webhooks.
	 * @param port Port to listen on.
	 * @param callback Optional callback tha runs when the server sucessfully
	 * starts listening.
	 */
	start(port: number | string, callback?: () => void) {
		this.registerPendingCommands()
			.then(async () => await this.prune())
			.then(() =>
				this.app.listen(port, () => {
					if (this.testGuildId) {
						console.log(
							chalk.yellow('Starting in test mode with guild', this.testGuildId)
						)
					}
					if (callback) callback()
				})
			)
	}

	async getExistingCommandsFromServer(): Promise<{
		[id: string]: Command<any, any>
	}> {
		return this.rawCommands(
			this.testGuildId
				? `/applications/${this.id}/guilds/${this.testGuildId}/commands`
				: `/applications/${this.id}/commands`
		)
	}

	async getExistingGuildCommandsFromServer(
		guildId: string
	): Promise<{ [id: string]: Command<any, any> }> {
		return this.rawCommands(
			`/applications/${this.id}/guilds/${guildId}/commands`
		)
	}

	private async rawCommands(
		url: string
	): Promise<{ [id: string]: Command<any, any> }> {
		let commandsRaw = await this.api(url)
		let commands: { [id: string]: Command<any, any> } = {}
		for (const rawCmd of commandsRaw) {
			let cmd = new Command(rawCmd.name, rawCmd.description)
			cmd.options = rawCmd.options
			cmd.id = rawCmd.id
			commands[cmd.id] = cmd
		}
		return commands
	}

	async delete(id: string | Command<any, any>) {
		let _id: string = typeof id === 'string' ? id : id.id

		try {
			await this.api(`/applications/${this.id}/commands/${_id}`, 'DELETE')
			delete this.commands[_id]
		} catch (err) {
			console.error('Error deleting command', _id)
			console.error(err.message)
		}
	}

	async deleteGuild(id: string | Command<any, any>, guildId: string) {
		let _id: string = typeof id === 'string' ? id : id.id

		try {
			await this.api(
				`/applications/${this.id}/guilds/${guildId}/commands/${_id}`,
				'DELETE'
			)
			delete this.guildCommands[guildId][_id]
		} catch (err) {
			console.error('Error deleting command', _id, 'from guild', guildId)
			console.error(err.message)
		}
	}

	async deleteGlobalAll() {
		let cmds = await this.getExistingCommandsFromServer()
		let ids = Object.keys(cmds)
		await Promise.all(ids.map((id) => this.delete(id)))
	}

	async deleteGuildAll(guildId: string) {
		let guildCmds = await this.getExistingGuildCommandsFromServer(guildId)
		let ids = Object.keys(guildCmds)
		await Promise.all(ids.map((id) => this.deleteGuild(id, guildId)))
	}

	async add<N extends string, T extends CommandOption<any>[]>(
		command: Command<N, T>
	) {
		// this.registerCommand((command as unknown) as Command<any, any>)
		this.pendingCommands.push(command)
	}

	private async registerPendingCommands() {
		await Promise.all(
			this.pendingCommands.map((cmd) => this.registerCommand(cmd))
		)
	}

	async registerCommand(command: Command<any, any>, guildId?: string) {
		let endpoint: string
		let isGlobal: boolean = false
		if (!guildId) {
			isGlobal = true
			endpoint = this.testGuildId
				? `/applications/${this.id}/guilds/${this.testGuildId}/commands`
				: `/applications/${this.id}/commands`
		} else {
			this.guildCommands[guildId][command.name] = command
			endpoint = `/applications/${this.id}/guilds/${guildId}/commands`
		}
		try {
			let res = await this.api(endpoint, 'POST', command.serialize())
			command.id = res.id
			if (!guildId) {
				this.commands[command.id] = command
			} else {
				if (!this.guildCommands[guildId]) this.guildCommands[guildId] = {}
				this.guildCommands[guildId][command.id] = command
			}
			console.log(
				`Registered${isGlobal ? ' global ' : ' '}command: ${chalk.magenta(
					command.name
				)} ${chalk.yellow(res.id)}`
			)
		} catch (err) {
			console.error('Error registering command', command.name)
			console.error(err.message)
		}
	}

	/**
	 * Prune global commands that don't have a handler.
	 */
	async prune() {
		const loadedCommandIds = Object.keys(this.commands)
		const pruneTargetIds = Object.entries(
			await this.getExistingCommandsFromServer()
		).filter(([key, val]) => !loadedCommandIds.includes(key))
		const prune = async (id: string, guild?: string) => {
			await this.api(
				!!guild
					? `/applications/${this.id}/guilds/${guild}/commands/${id}`
					: `/applications/${this.id}/commands/${id}`,
				'DELETE'
			)
		}
		await Promise.all(
			pruneTargetIds.map(([id, cmd]) =>
				(async () => {
					try {
						await prune(id, this.testGuildId)
						console.log(
							'Pruned unhandled global command',
							chalk.magenta(cmd.name),
							chalk.yellow(id)
						)
					} catch (err) {
						console.error(chalk.red('Error deleting command'), chalk.red(id))
						console.error(chalk.red(err.message))
					}
				})()
			)
		)
	}

	/** Make a manual call to the Discord API.
	 * @param extension A URL fragment. Automatically prefixed by
	 * `https://discord.com/api/v8`.
	 *
	 * For example, passing `users/@me` or `/users/@me` will map to
	 * `https://discord.com/api/v8/users/@me`
	 */
	async api(
		extension: string,
		method: 'GET' | 'POST' | 'DELETE' | 'PATCH' = 'GET',
		body?: object
	): Promise<any> {
		let e = extension.charAt(0) == '/' ? extension : '/' + extension
		let url = 'https://discord.com/api/v8' + e
		let res = await fetch(url, {
			headers: {
				Authorization: 'Bot ' + this.token,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
			method,
		})
		let bodytext = await res.text()
		let json: any
		try {
			json = JSON.parse(bodytext)
		} catch (err) {}

		if (json?.code) {
			throw new Error(
				chalk.red('Discord API returned error code') +
					' ' +
					chalk.yellow(json.code) +
					' - ' +
					chalk.red(JSON.stringify(json.message)) +
					'\n' +
					chalk.red(JSON.stringify(json.errors, null, 2))
			)
		}
		return json
	}
}
