import { command } from './command'
import { GougeClient } from './index'

describe('recursive handler function grabbing', () => {
	const client = new GougeClient({} as any)

	let plainBagelCalled = false
	let poppyseedBagelCalled = false
	let whiteLoafCalled = false
	let wheatLoafCalled = false

	let blueberryCalled = false
	let raspberryCalled = false

	afterEach(() => {
		plainBagelCalled = false
		poppyseedBagelCalled = false
		whiteLoafCalled = false
		wheatLoafCalled = false
		blueberryCalled = false
		raspberryCalled = false
	})

	client.commands['abcdef'] = command('breads', '')
		.group(
			'bagels',
			'',
			command('plain', 'a plain bagel').handler(async () => {
				plainBagelCalled = true
			}),
			command('poppyseed', 'a poppyseed bagel')
				.integer('seeds', 'number of seeds')
				.handler(async () => {
					poppyseedBagelCalled = true
				})
		)
		.group(
			'loafs',
			'',
			command('white', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async () => {
					whiteLoafCalled = true
				}),
			command('wheat', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async () => {
					wheatLoafCalled = true
				})
		)
	client.commands['qwert'] = command('berries', '')
		.subcommand(
			command('blueberry', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async () => {
					blueberryCalled = true
				})
		)
		.subcommand(
			command('raspberry', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async () => {
					raspberryCalled = true
				})
		)

	test('first subcommand in group', async () => {
		let [handler, args] = client.getFxn({
			id: 'abcdef',
			token: '34',
			type: 1,
			version: 1,
			data: {
				id: 'abcdef',
				name: 'breads',
				options: [
					{
						type: 2,
						name: 'bagels',
						options: [
							{
								type: 1,
								name: 'plain',
							},
						],
					},
				],
			},
		} as any)
		await (handler as any)()
		expect(plainBagelCalled).toBe(true)
	})
	test('second subcommand in group', async () => {
		let [handler, args] = client.getFxn({
			id: 'abcdef',
			token: '34',
			type: 1,
			version: 1,
			data: {
				id: 'abcdef',
				name: 'breads',
				options: [
					{
						type: 2,
						name: 'bagels',
						options: [
							{
								type: 1,
								name: 'poppyseed',
								options: [
									{
										type: 4,
										value: 100,
									},
								],
							},
						],
					},
				],
			},
		} as any)
		await (handler as any)()
		expect(poppyseedBagelCalled).toBe(true)
	})
})
