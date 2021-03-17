import { IEmbed } from './Embed'

export interface Response {
	tts?: boolean
	content?: string
	embeds?: IEmbed[]
	allowed_mentions?: AllowedMentions
	flags?: 64
}

export interface AllowedMentions {
	parse?: ('roles' | 'users' | 'everyone')[]
	roles?: string[]
	users?: string[]
	replied_user?: boolean
}
