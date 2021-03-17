import { GougeClient } from './client'
import { CommandOption } from './command-types'
import { ConvertOptionArrayToInteractionArgArray } from './types/Interaction'
import { Response } from './types/Response'

export type CommandHandler<T extends CommandOption<any>[]> = (
	client: GougeClient,
	respond: ResponseFunction,
	args: ConvertOptionArrayToInteractionArgArray<T>
) => Promise<void>

type EditResponse = (edit: Response) => Promise<void>
type DeleteResponse = () => Promise<void>
type FollowupResponse = (content: Response) => Promise<[EditFollowupResponse]>
type EditFollowupResponse = (content: Response) => Promise<void>

export type ResponseFunction = (
	response: string | Response
) => Promise<[EditResponse, DeleteResponse, FollowupResponse]>
