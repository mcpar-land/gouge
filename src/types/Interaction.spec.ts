import { command } from '../command'

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
		expect(cmd.convertInteractionToArgs(i)).toEqual(args)
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
		expect(cmd.convertInteractionToArgs(i)).toEqual(args)
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
		expect(cmd.convertInteractionToArgs(i)).toEqual(args)
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
		expect(cmd.convertInteractionToArgs(i)).toEqual(args)
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
		expect(cmd.convertInteractionToArgs(i)).toEqual(args)
	})
})
