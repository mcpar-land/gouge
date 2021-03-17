import { GougeClient } from './client'
import { CommandOption } from './command-types'
import { ConvertOptionArrayToInteractionArgArray } from './types/Interaction'
import { Response } from './types/Response'

export type CommandHandler<T extends CommandOption<any>[]> = (
	client: GougeClient,
	respond: ResponseFunction,
	args: ConvertOptionArrayToInteractionArgArray<T>
) => Promise<void>

export type EditResponse = (edit: Response) => Promise<void>
export type DeleteResponse = () => Promise<void>
export type FollowupResponse = (
	content: Response
) => Promise<[EditFollowupResponse]>
export type EditFollowupResponse = (content: Response) => Promise<void>

export type ResponseFunction = (
	response: string | Response
) => Promise<
	[(edit: Response) => Promise<void>, DeleteResponse, FollowupResponse]
>
