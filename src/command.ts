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
	CommandOptionRequirable,
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
import { ConvertOptionArrayToInteractionArgArray } from '.'

export type HandledCommand = NoHandlerCommand<CommandOption[]>

export type NoHandlerCommand<T extends CommandOption[]> = Omit<
	Command<T>,
	'handler' | 'boolean' | 'string' | 'integer' | 'user' | 'role' | 'channel'
>

export type SubCommandsCommand = Omit<
	NoHandlerCommand<CommandOptionSubCommand[]>,
	'group'
> & {
	type: CommandOptionType.SUB_COMMAND
}

export type SubCommandGroupCommand = Omit<
	NoHandlerCommand<CommandOptionSubCommandGroup[]>,
	'subcommand'
> & {
	type: CommandOptionType.SUB_COMMAND_GROUP
}

export class Command<T extends CommandOptionRequirable<boolean>[]> {
	/*implements CommandOptionSubCommand<N, T>*/ /** @internal */
	type: CommandOptionType = CommandOptionType.SUB_COMMAND
	name: string
	description: string
	id: string
	options: T
	private handlerFxn?: CommandHandler<T>

	constructor(name: string, description: string) {
		this.name = name
		this.description = description
		this.options = ([] as unknown) as T
		this.id = 'UNREGISTERED'
	}

	/**
	 * Add a string argument to a command. Adds a `string` to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @param choices
	 * @returns
	 */
	string<R extends boolean = false>(
		name: string,
		description: string,
		required: R = false as R,
		choices?: (string | OptionChoice<string>)[]
	): Command<CommandOptionArrayString<T, R>> {
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
		} as CommandOptionString<R>)
		return (this as unknown) as Command<CommandOptionArrayString<T, R>>
	}

	/**
	 * Add an integer argument to a command. Adds a `number` to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @param choices
	 * @returns
	 */
	integer<R extends boolean = false>(
		name: string,
		description: string,
		required: R = false as R,
		choices?: OptionChoice<number>[]
	): Command<CommandOptionArrayInteger<T, R>> {
		this.options.push({
			type: CommandOptionType.INTEGER,
			name,
			description,
			choices,
			required: required === undefined ? false : required,
		} as CommandOptionInteger<R>)
		return (this as unknown) as Command<CommandOptionArrayInteger<T, R>>
	}

	/**
	 * Add a boolean argument to a command. Adds a `boolean` to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
	boolean<R extends boolean = false>(
		name: string,
		description: string,
		required: R = false as R
	): Command<CommandOptionArrayBoolean<T, R>> {
		this.options.push({
			type: CommandOptionType.BOOLEAN,
			name,
			description,
			required: required === undefined ? false : required,
		} as CommandOptionBoolean<R>)
		return (this as unknown) as Command<CommandOptionArrayBoolean<T, R>>
	}

	/**
	 * Add a User argument to a command. Adds an `[[IUser]] | [[IMember]]`
	 * to the handler's inputs. (`IUser` is returned when the command is used
	 * in a DM, `IMember` is returned when used in a guild)
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
	user<R extends boolean = false>(
		name: string,
		description: string,
		required: R = false as R
	): Command<CommandOptionArrayUser<T, R>> {
		this.options.push({
			type: CommandOptionType.USER,
			name,
			description,
			required: required === undefined ? false : required,
		} as CommandOptionUser<R>)
		return (this as unknown) as Command<CommandOptionArrayUser<T, R>>
	}

	/**
	 * Add a Channel argument to a command. Adds an [[IChannel]] to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
	channel<R extends boolean = false>(
		name: string,
		description: string,
		required: R = false as R
	): Command<CommandOptionArrayChannel<T, R>> {
		this.options.push({
			type: CommandOptionType.CHANNEL,
			name,
			description,
			required: required === undefined ? false : required,
		} as CommandOptionChannel<R>)
		return (this as unknown) as Command<CommandOptionArrayChannel<T, R>>
	}

	/**
	 * Add a Role argument to a command. Adds an [[IRole]] to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
	role<R extends boolean = false>(
		name: string,
		description: string,
		required: R = false as R
	): Command<CommandOptionArrayRole<T, R>> {
		this.options.push({
			type: CommandOptionType.ROLE,
			name,
			description,
			required: required === undefined ? false : required,
		} as CommandOptionRole<R>)
		return (this as unknown) as Command<CommandOptionArrayRole<T, R>>
	}

	/**
	 * Add a subcommand to a command. Not compatible with any other input-adding
	 * functions.
	 * @param command
	 * @returns
	 */
	subcommand(command: HandledCommand): SubCommandsCommand {
		this.options.push(command)
		return (this as unknown) as SubCommandsCommand
	}

	/**
	 * Add a subcommand group to a command. Not compatible with any other
	 * input-adding functions.
	 * @param name
	 * @param description
	 * @param commands
	 * @returns
	 */
	group<Nn extends string>(
		name: Nn,
		description: string,
		...commands: HandledCommand[]
	): SubCommandGroupCommand {
		this.options.push({
			type: CommandOptionType.SUB_COMMAND_GROUP,
			name,
			description,
			options: commands,
		} as CommandOptionSubCommandGroup)
		return (this as unknown) as SubCommandGroupCommand
	}

	/** Write the handler for a command. */
	handler(handler: CommandHandler<T>): NoHandlerCommand<T> {
		this.handlerFxn = handler as any
		return this as NoHandlerCommand<T>
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

	/** @internal
	 *  Recursion should be handled elsewhere. This is NOT recursive.
	 */
	resolveOptions(options: any[] | undefined, resolvedValues: any): any[] {
		let names = this.argNames()
		let args = new Array(names.length).fill(undefined)
		if (!options || options.length == 0) return args
		for (const arg of options) {
			let i = names.indexOf(arg.name)
			args[i] = arg.value
			if (arg.type == CommandOptionType.ROLE) {
				args[i] = resolvedValues.roles[arg.value]
			} else if (arg.type == CommandOptionType.CHANNEL) {
				args[i] = resolvedValues.channels[arg.value]
			} else if (arg.type == CommandOptionType.USER) {
				const member = resolvedValues.members
					? resolvedValues.members[arg.value]
					: undefined
				const user = resolvedValues.users[arg.value]
				if (member) member.user = user
				args[i] = member || user
			}
		}
		return args
	}

	/**
	 * Returns true if a command has the same arguments, name, and description.
	 * @param command
	 * @returns
	 */
	equal(command: Command<any>): boolean {
		return (
			this.name == command.name &&
			this.description == command.description &&
			_.isEqual(this.options, command.options)
		)
	}
}

/**
 * Shortcut for
 * ```ts
 * new Command('name', 'description');
 * ```
 * @param name
 * @param description
 * @returns
 */
export function command(name: string, description: string): Command<[]> {
	return new Command(name, description)
}
