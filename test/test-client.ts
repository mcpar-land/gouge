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
		.boolean('only_smol', 'Whether to show only baby animals', false)
		.boolean('dangerous', 'Whether to show only dangerous animals', false)
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
		.role('special_role', 'Get a role', true)
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

client.start(process.env.PORT || 'NONE', async () => {
	console.log('Test client started listening')
	// await client.deleteGuildAll(process.env.TEST_GUILD_ID || 'none')
	// console.log('testing only: deleted all guild commands')
	// await client.deleteGlobalAll()
	// console.log('testing only: deleted all global commands')
})
