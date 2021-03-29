import {
	CommandHandler,
	CommandOptionType,
	ConvertOptionArrayToInteractionArgArray,
} from '.'
import {
	CommandOptionBoolean,
	CommandOptionInteger,
	CommandOptionString,
} from './command-types'

type TYPE_MAP = {
	a_number: number
	a_string: string
	a_boolean: boolean
	a_car: { speed: number; color: string }
}

type MappableArrayItem<K extends keyof TYPE_MAP, R extends true | false> = [
	K,
	R
]

type MappedArray<A extends MappableArrayItem<any, any>[]> = {
	[K in keyof A]: A[K] extends MappableArrayItem<infer _, infer R>
		? R extends true
			? TYPE_MAP[A[K][0]]
			: TYPE_MAP[A[K][0]] | undefined
		: never
}

type test = MappedArray<
	[
		['a_number', true],
		['a_string', true],
		['a_boolean', false],
		['a_car', false],
		['a_number', true]
	]
>

type TestArgs = [
	CommandOptionString<true>,
	CommandOptionInteger<true>,
	CommandOptionBoolean<false>,
	CommandOptionInteger<false>
]

type TestArray = ConvertOptionArrayToInteractionArgArray<TestArgs>

type TestHandler = CommandHandler<
	ConvertOptionArrayToInteractionArgArray<TestArgs>
>
