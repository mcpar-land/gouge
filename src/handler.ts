import { IUser, IChannel, IRole, IMember } from '.'
import { GougeClient } from './client'
import { CommandOption } from './command-types'
import {
	ConvertOptionArrayToInteractionArgArray,
	InteractionRaw,
} from './types/Interaction'
import { Response } from './types/Response'

/**
 * Handler callback, for use in [[Command.handler]]
 * @callback
 * @param client the client
 * @param respond response function
 * @param args flat array of values corresponding to the command's arguments, always in order.
 * - [[Command.string]] - string
 * - [[Command.integer]] - number
 * - [[Command.boolean]] - boolean
 * - [[Command.user]] - [[IUser]]
 * - [[Command.role]] - [[IRole]]
 * - [[Command.channel]] - [[IChannel]]
 *
 * @example
 * ```ts
 * command('ping', 'Respond with pong')
 * 	.handler(async (client, respond, []) => {
 * 		await respond("Ping pong!");
 * 	});
 * ```
 */
export type CommandHandler<T extends CommandOption<any>[]> = (
	client: GougeClient,
	respond: ResponseFunction,
	args: ConvertOptionArrayToInteractionArgArray<T>,
	props: {
		id: string
		guildId: string
		sender: IUser | IMember
		channelId: string
	}
) => Promise<void>

/**
 * Expected to return true if the command is handled, false otherwise.
 */
export type RawHandler = (
	client: GougeClient,
	respond: ResponseFunction,
	commandNames: string[],
	args: {
		[name: string]:
			| number
			| string
			| boolean
			| IUser
			| IMember
			| IChannel
			| IRole
	},
	props: {
		id: string
		guildId: string
	}
) => Promise<boolean>

/**
 * Edit an existing response message
 * (Only available from [[ResponseFunction]])
 *
 * @example
 * ```ts
 * async (client, respond, [arg1, arg2]) => {
 * 	const [edit] = await respond("This will be edited right away!");
 * 	await edit("Message edited!");
 * }
 * ```
 */
export type EditResponse = (edit: Response) => Promise<void>
/**
 * Delete an existing response message
 * (Only available from [[ResponseFunction]])
 *
 * @example
 * ```ts
 * async (client, respond, [arg1, arg2]) => {
 * 	const [edit, delete] = await respond("This will be deleted right away!");
 * 	await delete();
 * }
 * ```
 */
export type DeleteResponse = () => Promise<void>
/**
 * Send another message after an initial response message
 * (Only available from [[ResponseFunction]])
 *
 * Returns a function that can be used to edit the new message.
 *
 * @example
 * ```ts
 * async (client, respond, [arg1, arg2]) => {
 * 	const [edit, delete, followup] = await respond("First message");
 * 	let [editFollowup] = await followup("Followup message");
 * 	await editFollowup("Edited followup message");
 * }
 * ```
 */
export type FollowupResponse = (
	content: Response
) => Promise<[EditFollowupResponse]>
export type EditFollowupResponse = (content: Response) => Promise<void>

/**
 * The second argument in the callback to [[Command.handler]].
 * Used to send back your response.
 *
 * Returns a number of functions you can use after to perform more actions on
 * the response.
 * - Edit the response: [[EditResponse]]
 * - Delete the response: [[DeleteResponse]]
 * - Send more responses: [[FollowupResponse]]
 */
export type ResponseFunction = (
	response: string | Response
) => Promise<[EditResponse, DeleteResponse, FollowupResponse]>

export function responseFunction(
	client: GougeClient,
	interaction: any
): ResponseFunction {
	return async (response: string | Response) => {
		await client.api(
			`/interactions/${interaction.id}/${interaction.token}/callback`,
			'POST',
			{
				type: 4,
				data: stringToResponse(response),
			}
		)
		let interactionToken = interaction.token
		let urlPrefix = `/webhooks/${client.id}/${interactionToken}`

		return [
			async (edit: string | Response) => {
				await client.api(
					`${urlPrefix}/messages/@original`,
					'PATCH',
					stringToResponse(edit)
				)
			},
			async () => {
				await client.api(`${urlPrefix}/messages/@original`, 'DELETE')
			},
			async (content: string | Response) => {
				let fres = await client.api(
					`${urlPrefix}`,
					'POST',
					stringToResponse(content)
				)
				let newId = fres.id
				return [
					async (edit: string | Response) => {
						await client.api(
							`${urlPrefix}/messages/${newId}`,
							'PATCH',
							stringToResponse(edit)
						)
					},
				]
			},
		]
	}
}

function stringToResponse(inp: string | Response): Response {
	let _inp = inp
	if (typeof _inp === 'string') {
		_inp = { content: _inp }
	}
	return _inp
}
