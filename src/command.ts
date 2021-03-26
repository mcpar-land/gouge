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

	/**
	 * Add a string argument to a command. Adds a `string` to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @param choices
	 * @returns
	 */
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

	/**
	 * Add an integer argument to a command. Adds a `number` to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @param choices
	 * @returns
	 */
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

	/**
	 * Add a boolean argument to a command. Adds a `boolean` to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
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

	/**
	 * Add a User argument to a command. Adds an `[[IUser]] | [[IMember]]`
	 * to the handler's inputs. (`IUser` is returned when the command is used
	 * in a DM, `IMember` is returned when used in a guild)
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
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

	/**
	 * Add a Channel argument to a command. Adds an [[IChannel]] to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
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

	/**
	 * Add a Role argument to a command. Adds an [[IRole]] to the handler's
	 * inputs.
	 * @param name
	 * @param description
	 * @param required
	 * @returns
	 */
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

	/**
	 * Add a subcommand to a command. Not compatible with any other input-adding
	 * functions.
	 * @param command
	 * @returns
	 */
	subcommand<Nn extends string, O extends CommandOption<any>[]>(
		command: Command<Nn, O>
	): Command<N, CommandOptionArraySubCommand<Nn, O, T>> {
		this.options.push(command)
		return (this as unknown) as Command<
			N,
			CommandOptionArraySubCommand<Nn, O, T>
		>
	}

	/**
	 * Add a subcommand group to a command. Not compatible with any other
	 * input-adding functions.
	 * @param name
	 * @param description
	 * @param commands
	 * @returns
	 */
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

	/** Write the handler for a command. */
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
	equal(command: Command<any, any>): boolean {
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
export function command<Nn extends string>(
	name: Nn,
	description: string
): Command<Nn, []> {
	return new Command(name, description)
}
