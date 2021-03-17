import {
	CommandOption,
	CommandOptionRequirable,
	CommandOptionSubCommand,
	CommandOptionSubCommandGroup,
	CommandOptionType,
} from '../command-types'
import { IChannel, IMember, IRole, IUser } from './Discord'

export type Snowflake = string

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

export enum InteractionType {
	Ping = 1,
	ApplicationCommand = 2,
}

export interface InteractionData<D> {
	id: Snowflake
	name: string
	options: D
}

export interface InteractionDataOption<N extends string> {
	name: N
}

export interface InteractionDataOptionValue<N extends string, V>
	extends InteractionDataOption<N> {
	value: V
}

export interface InteractionDataOptionOptions<
	N extends string,
	O extends (
		| InteractionDataOption<any>
		| TYPE_MAP[CommandOptionType]
		| undefined
	)[]
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

export type ConvertOptionArrayToInteractionArgArray<
	A extends CommandOption<any>[]
> = {
	[K in keyof A]: A[K] extends CommandOption<infer _>
		? ConvertOptionToInteractionArg<A[K]>
		: unknown
}
