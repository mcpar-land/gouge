import {
	CommandOption,
	CommandOptionRequirable,
	CommandOptionSubCommand,
	CommandOptionSubCommandGroup,
	CommandOptionType,
} from '../command-types'
import { IChannel, IMember, IRole, IUser } from './Discord'

export type Snowflake = string

/** @internal */
export interface InteractionRaw<D> {
	id: Snowflake
	type: InteractionType
	data: InteractionData<D>
	guild_id?: Snowflake
	channel_id?: Snowflake
	member?: IMember
	user?: IUser
	token: string
	version: 1
}

/* @internal */
export enum InteractionType {
	Ping = 1,
	ApplicationCommand = 2,
}

/** @internal */
export interface InteractionData<D> {
	id: Snowflake
	name: string
	options: D
}

/** @internal */
export interface InteractionDataOption<N extends string> {
	name: N
}

/** @internal */
export interface InteractionDataOptionValue<N extends string, V>
	extends InteractionDataOption<N> {
	value: V
}

/** @internal */
export interface InteractionDataOptionOptions<
	N extends string,
	O extends (
		| InteractionDataOption<any>
		| TYPE_MAP[CommandOptionType]
		| undefined
	)[] = (InteractionDataOption<any> | TYPE_MAP[CommandOptionType] | undefined)[]
> extends InteractionDataOption<N> {
	options: O
}

type TYPE_MAP = {
	[CommandOptionType.SUB_COMMAND]: unknown
	[CommandOptionType.SUB_COMMAND_GROUP]: unknown
	[CommandOptionType.STRING]: string
	[CommandOptionType.INTEGER]: number
	[CommandOptionType.BOOLEAN]: boolean
	[CommandOptionType.USER]: IMember | IUser
	[CommandOptionType.CHANNEL]: IChannel
	[CommandOptionType.ROLE]: IRole
}

type ConvertOptionToInteractionArg<
	T extends CommandOption<any>
> = T extends CommandOptionSubCommandGroup<infer N, infer O>
	?
			| InteractionDataOptionOptions<
					N,
					ConvertOptionArrayToInteractionArgArray<O>
			  >
			| undefined
	: T extends CommandOptionSubCommand<infer N, infer O>
	?
			| InteractionDataOptionOptions<
					N,
					ConvertOptionArrayToInteractionArgArray<O>
			  >
			| undefined
	: T extends CommandOptionRequirable<infer N, infer R>
	? R extends true
		? TYPE_MAP[T['type']]
		: TYPE_MAP[T['type']] | undefined
	: unknown

/** @internal */
export type ConvertOptionArrayToInteractionArgArray<
	A extends CommandOption<any>[]
> = {
	[K in keyof A]: A[K] extends CommandOption<infer _>
		? ConvertOptionToInteractionArg<A[K]>
		: unknown
}

export function interactionCommandNames(
	interaction: any
): [
	string[],
	{
		[name: string]: any
	}
] {
	let [names, data] = icnRecurse(interaction.data, [interaction.data.name])
	let args: any = {}
	if (data.options)
		for (const v of data.options) {
			args[v.name] = v.value
		}
	return [names, args]
}

function icnRecurse(data: any, names: string[]): [string[], any] {
	if (
		data.options &&
		data.options.length > 0 &&
		(data.options[0].type === CommandOptionType.SUB_COMMAND ||
			data.options[0].type === CommandOptionType.SUB_COMMAND_GROUP)
	) {
		return icnRecurse(data.options[0], [...names, data.options[0].name])
	} else {
		return [names, data]
	}
}
