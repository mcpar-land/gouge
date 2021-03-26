import { command } from '../command'
import { CommandOptionType } from '../command-types'
import { interactionCommandNames } from './Interaction'

test('interaction command names', () => {
	expect(
		interactionCommandNames({
			data: {
				name: 'zero',
				options: [
					{
						name: 'arg',
						type: CommandOptionType.BOOLEAN,
					},
				],
			},
		})[0]
	).toEqual(['zero'])
	expect(
		interactionCommandNames({
			data: {
				name: 'one',
				options: [
					{
						name: 'two',
						type: CommandOptionType.SUB_COMMAND,
						options: [
							{
								name: 'subtwo',
								type: CommandOptionType.INTEGER,
							},
						],
					},
				],
			},
		})[0]
	).toEqual(['one', 'two'])
	expect(
		interactionCommandNames({
			data: {
				name: 'a',
				options: [
					{
						name: 'b',
						type: CommandOptionType.SUB_COMMAND_GROUP,
						options: [
							{
								name: 'c',
								type: CommandOptionType.SUB_COMMAND,
								options: [
									{
										name: 'arg',
										type: CommandOptionType.STRING,
									},
								],
							},
						],
					},
				],
			},
		})[0]
	).toEqual(['a', 'b', 'c'])
})

describe('convert interaction to handler', () => {
	let cmd = command('foo', 'foo cmd')
		.integer('foo1', 'First foo arg', true, undefined)
		.integer('foo2', 'Second foo arg')
		.integer('foo3', 'Third foo arg')
		.boolean('foo4', 'Fourth foo arg')

	test('all args', () => {
		let i = {
			data: {
				name: 'foo',
				options: [
					{
						name: 'foo1',
						value: 69,
					},
					{
						name: 'foo2',
						value: 69,
					},
					{
						name: 'foo3',
						value: 69,
					},
					{
						name: 'foo4',
						value: true,
					},
				],
			},
		}
		let args = [69, 69, 69, true]
		expect(cmd.resolveOptions(i.data.options, [])).toEqual(args)
	})
	test('only required args', () => {
		let i = {
			data: {
				name: 'foo',
				options: [
					{
						name: 'foo1',
						value: 69,
					},
				],
			},
		}
		let args = [69, undefined, undefined, undefined]
		expect(cmd.resolveOptions(i.data.options, [])).toEqual(args)
	})
	test('missing tailing args', () => {
		let i = {
			data: {
				name: 'foo',
				options: [
					{
						name: 'foo1',
						value: 69,
					},
					{
						name: 'foo2',
						value: 69,
					},
				],
			},
		}
		let args = [69, 69, undefined, undefined]
		expect(cmd.resolveOptions(i.data.options, [])).toEqual(args)
	})
	test('missing center args', () => {
		let i = {
			data: {
				name: 'foo',
				options: [
					{
						name: 'foo1',
						value: 69,
					},
					{
						name: 'foo4',
						value: true,
					},
				],
			},
		}
		let args = [69, undefined, undefined, true]
		expect(cmd.resolveOptions(i.data.options, [])).toEqual(args)
	})
	test('missing center and tailing', () => {
		let i = {
			data: {
				name: 'foo',
				options: [
					{
						name: 'foo1',
						value: 69,
					},
					{
						name: 'foo3',
						value: 69,
					},
				],
			},
		}
		let args = [69, undefined, 69, undefined]
		expect(cmd.resolveOptions(i.data.options, [])).toEqual(args)
	})
})

describe('resolve values', () => {
	const testcommand = command('testcommand', '')
		.string('frindle', '', true)
		.user('someuser', '')
		.role('somerole', '')
		.channel('somechannel', '')

	test('resolve user', () => {
		let opts = [
			{
				name: 'frindle',
				type: 3,
				value: 'pen pen pen',
			},
			{
				name: 'someuser',
				type: 6,
				value: '123456789',
			},
		]
		let resolved = {
			users: {
				'123456789': {
					id: '123456789',
					username: 'Some User',
				},
			},
		}
		expect(testcommand.resolveOptions(opts, resolved)).toEqual([
			'pen pen pen',
			{
				id: '123456789',
				username: 'Some User',
			},
			undefined,
			undefined,
		])
	})
	test('resolve member', () => {
		let opts = [
			{
				name: 'frindle',
				type: 3,
				value: 'pen pen pen',
			},
			{
				name: 'someuser',
				type: 6,
				value: '123456789',
			},
		]
		let resolved = {
			members: {
				'123456789': {
					id: '123456789',
					nick: 'Some Nickname',
				},
			},
			users: {
				'123456789': {
					id: '123456789',
					username: 'Some User',
				},
			},
		}
		expect(testcommand.resolveOptions(opts, resolved)).toEqual([
			'pen pen pen',
			{
				id: '123456789',
				nick: 'Some Nickname',
				user: {
					id: '123456789',
					username: 'Some User',
				},
			},
			undefined,
			undefined,
		])
	})
	test('resolve role', () => {
		let opts = [
			{
				name: 'frindle',
				type: 3,
				value: 'pen pen pen pen',
			},
			{
				name: 'somerole',
				type: 8,
				value: '123456789',
			},
		]
		let resolved = {
			roles: {
				'123456789': {
					id: '123456789',
					name: 'Some Role',
				},
			},
		}
		expect(testcommand.resolveOptions(opts, resolved)).toEqual([
			'pen pen pen pen',
			undefined,
			{
				id: '123456789',
				name: 'Some Role',
			},
			undefined,
		])
	})
	test('resolve channel', () => {
		let opts = [
			{
				name: 'frindle',
				type: 3,
				value: 'pen pen pen pen',
			},
			{
				name: 'somechannel',
				type: 7,
				value: '123456789',
			},
		]
		let resolved = {
			channels: {
				'123456789': {
					id: '123456789',
					name: 'Some Channel',
				},
			},
		}
		expect(testcommand.resolveOptions(opts, resolved)).toEqual([
			'pen pen pen pen',
			undefined,
			undefined,
			{
				id: '123456789',
				name: 'Some Channel',
			},
		])
	})
})
