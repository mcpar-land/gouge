import { GougeClient } from './client'
import {
	CommandOption,
	CommandOptionArrayBoolean,
	CommandOptionArrayChannel,
	CommandOptionArrayInteger,
	CommandOptionArrayRole,
	CommandOptionArrayString,
	CommandOptionArraySubCommand,
	CommandOptionArraySubCommandGroup,
	CommandOptionArrayUser,
	CommandOptionBoolean,
	CommandOptionChannel,
	CommandOptionInteger,
	CommandOptionRole,
	CommandOptionString,
	CommandOptionSubCommand,
	CommandOptionSubCommandGroup,
	CommandOptionType,
	CommandOptionUser,
	OptionChoice,
} from './command-types'
import { CommandHandler, ResponseFunction } from './handler'
import _ from 'lodash'
import { Response } from './types/Response'

export class Command<N extends string, T extends CommandOption<any>[]>
	implements CommandOptionSubCommand<N, T> {
	/** @internal */
	type: CommandOptionType.SUB_COMMAND = CommandOptionType.SUB_COMMAND
	name: N
	description: string
	id: string
	options: T
	private handlerFxn?: CommandHandler<T>

	constructor(name: N, description: string) {
		this.name = name
		this.description = description
		this.options = ([] as unknown) as T
		this.id = 'UNREGISTERED'
	}

	string<Nn extends string, R extends true | false | undefined>(
		name: Nn,
		description: string,
		required?: R,
		choices?: (string | OptionChoice<string>)[]
	): Command<N, CommandOptionArrayString<Nn, T, R>> {
		let c = choices?.map((choice) => {
			if (typeof choice === 'string') {
				return { name: choice, value: choice }
			} else {
				return choice
			}
		})
		this.options.push({
			type: CommandOptionType.STRING,
			name,
			description,
			choices: c,
			required,
		} as CommandOptionString<Nn, R>)
		return (this as unknown) as Command<N, CommandOptionArrayString<Nn, T, R>>
	}

	integer<Nn extends string, R extends true | false | undefined>(
		name: Nn,
		description: string,
		required?: R,
		choices?: OptionChoice<number>[]
	): Command<N, CommandOptionArrayInteger<Nn, T, R>> {
		this.options.push({
			type: CommandOptionType.INTEGER,
			name,
			description,
			choices,
			required,
		} as CommandOptionInteger<Nn, R>)
		return (this as unknown) as Command<N, CommandOptionArrayInteger<Nn, T, R>>
	}

	boolean<Nn extends string, R extends true | false | undefined>(
		name: Nn,
		description: string,
		required?: R
	): Command<N, CommandOptionArrayBoolean<Nn, T, R>> {
		this.options.push({
			type: CommandOptionType.BOOLEAN,
			name,
			description,
			required,
		} as CommandOptionBoolean<Nn, R>)
		return (this as unknown) as Command<N, CommandOptionArrayBoolean<Nn, T, R>>
	}

	user<Nn extends string, R extends true | false | undefined>(
		name: Nn,
		description: string,
		required?: R
	): Command<N, CommandOptionArrayUser<Nn, T, R>> {
		this.options.push({
			type: CommandOptionType.USER,
			name,
			description,
			required,
		} as CommandOptionUser<Nn, R>)
		return (this as unknown) as Command<N, CommandOptionArrayUser<Nn, T, R>>
	}

	channel<Nn extends string, R extends true | false | undefined>(
		name: Nn,
		description: string,
		required?: R
	): Command<N, CommandOptionArrayChannel<Nn, T, R>> {
		this.options.push({
			type: CommandOptionType.CHANNEL,
			name,
			description,
			required,
		} as CommandOptionChannel<Nn, R>)
		return (this as unknown) as Command<N, CommandOptionArrayChannel<Nn, T, R>>
	}

	role<Nn extends string, R extends true | false | undefined>(
		name: Nn,
		description: string,
		required?: R
	): Command<N, CommandOptionArrayRole<Nn, T, R>> {
		this.options.push({
			type: CommandOptionType.ROLE,
			name,
			description,
			required,
		} as CommandOptionRole<Nn, R>)
		return (this as unknown) as Command<N, CommandOptionArrayRole<Nn, T, R>>
	}

	subcommand<Nn extends string, O extends CommandOption<any>[]>(
		command: Command<Nn, O>
	): Command<N, CommandOptionArraySubCommand<Nn, O, T>> {
		this.options.push(command)
		return (this as unknown) as Command<
			N,
			CommandOptionArraySubCommand<Nn, O, T>
		>
	}

	group<Nn extends string, S extends CommandOptionSubCommand<any, any>[]>(
		name: Nn,
		description: string,
		...commands: S
	): Command<N, CommandOptionArraySubCommandGroup<Nn, S, T>> {
		this.options.push({
			type: CommandOptionType.SUB_COMMAND_GROUP,
			name,
			description,
			options: commands,
		} as CommandOptionSubCommandGroup<Nn, S>)
		return (this as unknown) as Command<
			N,
			CommandOptionArraySubCommandGroup<Nn, S, T>
		>
	}

	handler(handler: CommandHandler<T>): Command<N, T> {
		this.handlerFxn = handler
		return this
	}

	serialize(): object {
		return JSON.parse(JSON.stringify(this))
	}

	/**
	 * Returns an array of the argument names, in the correct order.
	 * @returns
	 */
	argNames(): string[] {
		let names: string[] = []
		for (const option of this.options) {
			names.push(option.name)
		}
		return names
	}

	/** @internal */
	convertInteractionToArgs(interaction: any): any[] {
		let names = this.argNames()
		let args = new Array(names.length).fill(undefined)
		for (const arg of interaction.data.options) {
			let i = names.indexOf(arg.name)
			args[i] = arg.value
			if (arg.type == CommandOptionType.ROLE) {
				args[i] = interaction.data.resolved.roles[arg.value]
			} else if (arg.type == CommandOptionType.CHANNEL) {
				args[i] = interaction.data.resolved.channels[arg.value]
			} else if (arg.type == CommandOptionType.USER) {
				const member = interaction.data.resolved.members[arg.value]
				const user = interaction.data.resolved.users[arg.value]
				if (member) member.user = user
				args[i] = member || user
			}
		}
		return args
	}

	async doHandle(client: GougeClient, interaction: any): Promise<void> {
		if (this.handlerFxn) {
			const respondFxn: ResponseFunction = async (
				response: string | Response
			) => {
				await client.api(
					`/interactions/${interaction.id}/${interaction.token}/callback`,
					'POST',
					{
						type: 4,
						data: stringToResponse(response),
					}
				)
				let interactionToken = interaction.token
				let urlPrefix = `/webhooks/${client.id}/${interactionToken}`

				return [
					async (edit: string | Response) => {
						await client.api(
							`${urlPrefix}/messages/@original`,
							'PATCH',
							stringToResponse(edit)
						)
					},
					async () => {
						await client.api(`${urlPrefix}/messages/@original`, 'DELETE')
					},
					async (content: string | Response) => {
						let fres = await client.api(
							`${urlPrefix}`,
							'POST',
							stringToResponse(content)
						)
						let newId = fres.id
						return [
							async (edit: string | Response) => {
								await client.api(
									`${urlPrefix}/messages/${newId}`,
									'PATCH',
									stringToResponse(edit)
								)
							},
						]
					},
				]
			}
			const args = this.convertInteractionToArgs(interaction)
			await this.handlerFxn(client, respondFxn, args as any)
		}
	}

	equal(command: Command<any, any>): boolean {
		return (
			this.name == command.name &&
			this.description == command.description &&
			_.isEqual(this.options, command.options)
		)
	}
}

export function command<Nn extends string>(
	name: Nn,
	description: string
): Command<Nn, []> {
	return new Command(name, description)
}

function stringToResponse(inp: string | Response): Response {
	let _inp = inp
	if (typeof _inp === 'string') {
		_inp = { content: _inp }
	}
	return _inp
}