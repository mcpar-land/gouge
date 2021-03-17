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
export interface CommandOption<N extends string> {
	type: CommandOptionType
	name: N
	description: string
}

/** @internal */
export interface CommandOptionSubCommand<
	N extends string,
	O extends CommandOptionRequirable<any>[]
> extends CommandOption<N> {
	type: CommandOptionType.SUB_COMMAND
	options: O
}

/** @internal */
export interface CommandOptionSubCommandGroup<
	N extends string,
	O extends CommandOptionSubCommand<any, any>[]
> extends CommandOption<N> {
	type: CommandOptionType.SUB_COMMAND_GROUP
	options: O
}

/** @internal */
export interface CommandOptionRequirable<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOption<N> {
	required?: R
}

/** @internal */
export interface CommandOptionString<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.STRING
	choices?: OptionChoice<string>[]
}

/** @internal */
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

/** @internal */
export interface CommandOptionUser<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.USER
}

/** @internal */
export interface CommandOptionChannel<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.CHANNEL
}

/** @internal */
export interface CommandOptionRole<
	N extends string,
	R extends true | false | undefined = undefined
> extends CommandOptionRequirable<N, R> {
	type: CommandOptionType.ROLE
}

/** @internal */
export type CommandOptionArraySubCommand<
	N extends string,
	O extends CommandOptionRequirable<any>[],
	A extends CommandOption<any>[]
> = [...A, CommandOptionSubCommand<N, O>]

/** @internal */
export type CommandOptionArraySubCommandGroup<
	N extends string,
	S extends CommandOptionSubCommand<any, any>[],
	A extends CommandOption<any>[]
> = [...A, CommandOptionSubCommand<N, S>]

/** @internal */
export type CommandOptionArrayString<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionString<N, R>]

/** @internal */
export type CommandOptionArrayInteger<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionInteger<N, R>]

/** @internal */
export type CommandOptionArrayBoolean<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionBoolean<N, R>]

/** @internal */
export type CommandOptionArrayUser<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionUser<N, R>]

/** @internal */
export type CommandOptionArrayChannel<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionChannel<N, R>]

/** @internal */
export type CommandOptionArrayRole<
	N extends string,
	A extends CommandOptionRequirable<any>[],
	R extends true | false | undefined = undefined
> = [...A, CommandOptionRole<N, R>]
