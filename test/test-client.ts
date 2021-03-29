'use strict'
import { GougeClient } from '../src/client'
import { command } from '../src/command'
import dotenv from 'dotenv'

dotenv.config()

const client = new GougeClient({
	id: process.env.CLIENT_ID || 'NONE',
	key: process.env.PUBLIC_KEY || 'NONE',
	secret: process.env.CLIENT_SECRET || 'NONE',
	token: process.env.BOT_TOKEN || 'NONE',
	testGuildId: process.env.TEST_GUILD_ID,
})

client.with(
	command('blep', 'Send a random adorable animal photo')
		.string('animal', 'The type of animal', true, [
			{ name: 'Dog', value: 'animal_dog' },
			{ name: 'Cat', value: 'animal_cat' },
			{ name: 'Penguin', value: 'animal_penguin' },
		])
		.boolean('only_smol', 'Whether to show only baby animals', true)
		.boolean('dangerous', 'Whether to show only dangerous animals')
		.integer('count', 'Show more than 1 picture', false)
		.handler(async (client, respond, [animal, onlySmol, dangerous, count]) => {
			const [edit, del, followup] = await respond({
				content:
					`Animal: ${animal}\n` +
					`only_smol: ${onlySmol}\n` +
					`dangerous: ${dangerous}\n` +
					`count: ${count}`,
			})
			const [editFollowup] = await followup({
				content: 'great job.',
			})
			await editFollowup({
				content: 'Actually, awful job.',
			})
		})
)
client.with(
	command('specials', 'Get arguments of special types')
		.user('special_user', 'Get a user', true)
		.channel('special_channel', 'Get a channel', true)
		.role('special_role', 'Get a role', false)
		.handler(async (client, respond, [user, channel, role]) => {
			let response =
				'User\n```' +
				JSON.stringify(user) +
				'```\nChannel\n```' +
				JSON.stringify(channel) +
				'```\nRole\n```' +
				JSON.stringify(role) +
				'```'
			await respond({
				content: response,
			})
		})
)
client.with(
	command('subhaver', 'Command with subcommands')
		.subcommand(
			command('sub1', 'first subcommand')
				.string('sub1a', 'sub command 1 argument a')
				.user('sub1b', 'sub command 1 argument b')
				.handler(async (client, respond, [a, b]) => {
					await respond(`**sub1** A: ${a}, B: ${b}`)
				})
		)
		.subcommand(
			command('sub2', 'second subcommand')
				.string('sub2a', 'sub command 2 argument a')
				.user('sub2b', 'sub command 2 argument b')
				.handler(async (client, respond, [a, b]) => {
					await respond(`**sub2** A: ${a}, B: ${b}`)
				})
		)
)

client.with(
	command('bread-groups', 'Various sorts of bread')
		.group(
			'bagels',
			'different kinds of bagels',
			command('plain', 'A plain bagel')
				.boolean('toasted', 'is this toasted or no')
				.boolean('creamcheese', 'does this have cream cheese')
				.handler(async (client, respond, [toasted, creamcheese]) => {
					await respond('You got a plain bagel!')
				}),
			command('poppy', 'A poppy seed bagel')
				.boolean('toasted', 'is this toasted or no')
				.boolean('creamcheese', 'does this have cream cheese')
				.handler(async (client, respond) => {
					await respond('You got a poppy seed bagel!')
				}),
			command('blueberry', 'A blueberry bagel')
				.boolean('toasted', 'is this toasted or no')
				.boolean('creamcheese', 'does this have cream cheese')
				.handler(async (client, respond) => {
					await respond('You got a blueberry bagel!')
				})
		)
		.group(
			'loafs',
			'Different kinds of loafs',
			command('white', 'A white bread loaf')
				.boolean('toasted', 'is this toasted or no')
				.boolean('creamcheese', 'does this have cream cheese')
				.handler(async (client, respond) => {
					await respond('You got a white loaf of bread!')
				}),
			command('wheat', 'A wheat bread loaf')
				.boolean('toasted', 'is this toasted or no')
				.boolean('creamcheese', 'does this have cream cheese')
				.handler(async (client, respond) => {
					await respond('You got a wheat loaf of bread!')
				}),
			command('sourdough', 'A sourdough bread loaf')
				.boolean('toasted', 'is this toasted or no')
				.boolean('creamcheese', 'does this have cream cheese')
				.handler(async (client, respond) => {
					await respond('You got a loaf of sourdough bread!')
				})
		)
)

client.start(process.env.PORT || 'NONE', async () => {
	console.log('Test client started listening')
	// await client.deleteGuildAll(process.env.TEST_GUILD_ID || 'none')
	// console.log('testing only: deleted all guild commands')
	// await client.deleteGlobalAll()
	// console.log('testing only: deleted all global commands')
})
