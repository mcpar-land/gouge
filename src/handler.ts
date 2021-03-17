import { GougeClient } from './client'
import { CommandOption } from './command-types'
import { ConvertOptionArrayToInteractionArgArray } from './types/Interaction'
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
	/**
	 * Hey, grat job
	 */
	args: ConvertOptionArrayToInteractionArgArray<T>
) => Promise<void>

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
