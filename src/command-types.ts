/** @internal */
export enum CommandOptionType {
	SUB_COMMAND = 1,
	SUB_COMMAND_GROUP = 2,
	STRING = 3,
	INTEGER = 4,
	BOOLEAN = 5,
	USER = 6,
	CHANNEL = 7,
	ROLE = 8,
}

/** @internal */
export interface OptionChoice<T> {
	name: string
	value: T
}

/** @internal */
export interface CommandOption {
	type: CommandOptionType
	name: string
	description: string
}

/** @internal */
export interface CommandOptionSubCommand extends CommandOption {
	type: CommandOptionType.SUB_COMMAND
	options: CommandOptionRequirable<any>[]
}

/** @internal */
export interface CommandOptionSubCommandGroup extends CommandOption {
	type: CommandOptionType.SUB_COMMAND_GROUP
	options: CommandOptionSubCommand[]
}

/** @internal */
export interface CommandOptionRequirable<R extends boolean = false>
	extends CommandOption {
	required?: R
}

/** @internal */
export interface CommandOptionString<R extends boolean>
	extends CommandOptionRequirable<R> {
	type: CommandOptionType.STRING
	choices?: OptionChoice<string>[]
}

/** @internal */
export interface CommandOptionInteger<R extends boolean>
	extends CommandOptionRequirable<R> {
	type: CommandOptionType.INTEGER
	choices?: OptionChoice<number>[]
}

/** @internal */
export interface CommandOptionBoolean<R extends boolean>
	extends CommandOptionRequirable<R> {
	type: CommandOptionType.BOOLEAN
}

/** @internal */
export interface CommandOptionUser<R extends boolean>
	extends CommandOptionRequirable<R> {
	type: CommandOptionType.USER
}

/** @internal */
export interface CommandOptionChannel<R extends boolean>
	extends CommandOptionRequirable<R> {
	type: CommandOptionType.CHANNEL
}

/** @internal */
export interface CommandOptionRole<R extends boolean>
	extends CommandOptionRequirable<R> {
	type: CommandOptionType.ROLE
}

/** @internal */
export type CommandOptionArraySubCommand<A extends CommandOption[]> = [
	...A,
	CommandOptionSubCommand
]

/** @internal */
export type CommandOptionArraySubCommandGroup<A extends CommandOption[]> = [
	...A,
	CommandOptionSubCommand
]

/** @internal */
export type CommandOptionArrayString<
	A extends CommandOptionRequirable<boolean>[],
	R extends boolean
> = [...A, CommandOptionString<R>]

/** @internal */
export type CommandOptionArrayInteger<
	A extends CommandOptionRequirable<boolean>[],
	R extends boolean
> = [...A, CommandOptionInteger<R>]

/** @internal */
export type CommandOptionArrayBoolean<
	A extends CommandOptionRequirable<boolean>[],
	R extends boolean
> = [...A, CommandOptionBoolean<R>]

/** @internal */
export type CommandOptionArrayUser<
	A extends CommandOptionRequirable<boolean>[],
	R extends boolean
> = [...A, CommandOptionUser<R>]

/** @internal */
export type CommandOptionArrayChannel<
	A extends CommandOptionRequirable<boolean>[],
	R extends boolean
> = [...A, CommandOptionChannel<R>]

/** @internal */
export type CommandOptionArrayRole<
	A extends CommandOptionRequirable<boolean>[],
	R extends boolean
> = [...A, CommandOptionRole<R>]
