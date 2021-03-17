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

export interface OptionChoice<T> {
	name: string
	value: T
}

export interface CommandOption<N extends string> {
	type: CommandOptionType
	name: N
	description: string
}

export interface CommandOptionSubCommand<
	N extends string,
	O extends CommandOptionRequirable<any>[]
> extends CommandOption<N> {
	type: CommandOptionType.SUB_COMMAND
	options: O
}

export interface CommandOptionSubCommandGroup<
	N extends string,
	O extends CommandOptionSubCommand<any, any>[]
> extends CommandOption<N> {
	type: CommandOptionType.SUB_COMMAND_GROUP
	options: O
}

export interface CommandOptionRequirable<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOption<N> {
	required?: R
}

export interface CommandOptionString<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.STRING
	choices?: OptionChoice<string>[]
}

export interface CommandOptionInteger<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.INTEGER
	choices?: OptionChoice<number>[]
}

export interface CommandOptionBoolean<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.BOOLEAN
}

export interface CommandOptionUser<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.USER
}

export interface CommandOptionChannel<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.CHANNEL
}

export interface CommandOptionRole<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.ROLE
}

export type CommandOptionArraySubCommand<
	N extends string,
	O extends CommandOptionRequirable<any>[],
	A extends CommandOption<any>[]
> = [...A, CommandOptionSubCommand<N, O>]

export type CommandOptionArraySubCommandGroup<
	N extends string,
	S extends CommandOptionSubCommand<any, any>[],
	A extends CommandOption<any>[]
> = [...A, CommandOptionSubCommand<N, S>]

export type CommandOptionArrayString<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionString<N, R>]

export type CommandOptionArrayInteger<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionInteger<N, R>]

export type CommandOptionArrayBoolean<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionBoolean<N, R>]

export type CommandOptionArrayUser<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionUser<N, R>]

export type CommandOptionArrayChannel<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionChannel<N, R>]

export type CommandOptionArrayRole<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionRole<N, R>]
