import { GougeClient, GougeClientOptions } from './client'
import { command } from './command'

describe('Create commands', () => {
	test('Create command with arguments', () => {
		let com = command('foo', 'the foo command')
			.string('first', 'the first argument')
			.integer('second', 'the second argument')
			.handler(async (client, _, [first, second]) => {
				console.log('first arg', first)
				console.log('second arg', second)
			})
	})

	test('Create command with subcommands', () => {
		let comWithSubs = command('bar', 'bar, which has subcommands')
			.subcommand(
				command('subone', 'the first subcommand')
					.boolean('subfirst', 'the first subcommand first argument')
					.handler(async (client, _, [subfirst]) => {
						console.log('subone', subfirst)
					})
			)
			.subcommand(
				command('subtwo', 'the second  subcommand')
					.boolean('subfirst', 'the second subcommand first argument')
					.handler(async (client, _, [subfirst]) => {
						console.log('subtwo', subfirst)
					})
			)
	})
	test('create command with subcommand groups', () => {
		let comWithSubGroups = command('baz', 'bas, which has groups')
			.group(
				'bagels',
				'bagel commands',
				command('plain', 'a plain bagel').handler(async () => {
					console.log('you got a plain bagel')
				}),
				command('poppy', 'a poppy seed bagel')
					.integer('seeds', 'the number of seeds')
					.handler(async (client, _, [seeds]) => {
						console.log('you got a poppy seed bagel')
					})
			)
			.group(
				'breads',
				'bread commands',
				command('wonder', 'a loaf of wonderbread')
					.boolean('terror', 'are you in terror')
					.handler(async (client, _, [terror]) => {
						console.log('you got a loaf of wonderbread')
					}),
				command('sourdough', 'a sourdough bread').handler(async () => {
					console.log('you got a loaf of sourdough bread')
				})
			)
	})
})
