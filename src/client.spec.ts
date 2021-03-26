import { command } from './command'
import { GougeClient } from './index'
import { InteractionType } from './types/Interaction'

describe('recursive handler function grabbing', () => {
	const client = new GougeClient({} as any)

	let pingRes: any = null
	let plainBagelRes: any = null
	let poppyseedBagelRes: any = null
	let whiteLoafRes: any = null
	let wheatLoafRes: any = null

	let blueberryRes: any = null
	let raspberryRes: any = null

	afterEach(() => {
		pingRes = null
		plainBagelRes = null
		poppyseedBagelRes = null
		whiteLoafRes = null
		wheatLoafRes = null
		blueberryRes = null
		raspberryRes = null
	})

	client.commands['00000'] = command('ping', '').handler(async (c, r, args) => {
		pingRes = args
	})

	client.commands['abcdef'] = command('breads', '')
		.group(
			'bagels',
			'',
			command('plain', 'a plain bagel').handler(async (c, r, args) => {
				plainBagelRes = args
			}),
			command('poppyseed', 'a poppyseed bagel')
				.integer('seeds', 'number of seeds')
				.handler(async (c, r, args) => {
					poppyseedBagelRes = args
				})
		)
		.group(
			'loafs',
			'',
			command('white', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async (c, r, args) => {
					whiteLoafRes = args
				}),
			command('wheat', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async (c, r, args) => {
					wheatLoafRes = args
				})
		)
	client.commands['qwert'] = command('berries', '')
		.subcommand(
			command('blueberry', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async (c, r, args) => {
					blueberryRes = args
				})
		)
		.subcommand(
			command('raspberry', '')
				.string('foo', '')
				.string('bar', '')
				.handler(async (c, r, args) => {
					raspberryRes = args
				})
		)

	test('base command', async () => {
		await client.handle({
			id: '2394871',
			token: '34',
			type: 1,
			version: 1,
			data: {
				id: '00000',
				name: 'ping',
			},
		})
		expect(pingRes).toEqual([])
	})

	test('first subcommand in group', async () => {
		await client.handle({
			id: '333',
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
		expect(plainBagelRes).toEqual([])
	})
	test('second subcommand in group', async () => {
		await client.handle({
			id: '13453145',
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
										name: 'seeds',
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
		expect(poppyseedBagelRes).toEqual([100])
	})
	test('first subcommand', async () => {
		await client.handle({
			id: '43645456',
			token: '34',
			type: 1,
			version: 1,
			data: {
				id: 'qwert',
				name: 'berries',
				options: [
					{
						type: 1,
						name: 'blueberry',
						options: [
							{
								name: 'foo',
								type: 3,
								value: 'foovalue',
							},
						],
					},
				],
			},
		} as any)
		expect(blueberryRes).toEqual(['foovalue', undefined])
	})
	test('second subcommand', async () => {
		await client.handle({
			id: '6y546y5654',
			token: '34',
			type: 1,
			version: 1,
			data: {
				id: 'qwert',
				name: 'berries',
				options: [
					{
						type: 1,
						name: 'raspberry',
						options: [
							{
								name: 'bar',
								type: 3,
								value: 'barvalue',
							},
						],
					},
				],
			},
		} as any)
		expect(raspberryRes).toEqual([undefined, 'barvalue'])
	})
})

describe('raw handle', () => {
	test('single raw handler', async () => {
		let rawHandlerCalled = false

		const client = new GougeClient({} as any)

		client.raw(async () => {
			rawHandlerCalled = true

			return true
		})

		await client.handle({
			id: '333',
			token: '34',
			type: InteractionType.ApplicationCommand,
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
			member: {},
			guild_id: '1234',
			channel_id: '45397548378549',
		})

		expect(rawHandlerCalled).toBe(true)
	})

	const testInteraction = {
		id: '34',
		token: 'asdf',
		type: InteractionType.ApplicationCommand,
		version: 1,
		data: {
			id: 'qwert',
			name: 'bolo_tie',
			options: [],
		},
		member: {},
		guild_id: '1234',
		channel_id: '12341234',
	}
	test('false with registered command', async () => {
		const client = new GougeClient({} as any)
		client.raw(async () => false)

		let handled = false

		client.commands['qwert'] = command('bolo_tie', '').handler(async () => {
			handled = true
		})

		await client.handle(testInteraction)
		expect(handled).toBe(true)
	})
	test('throw with false and no registered command', async () => {
		const client = new GougeClient({} as any)
		client.raw(async () => false)

		await expect(client.handle(testInteraction)).rejects.toThrow()
	})
})
