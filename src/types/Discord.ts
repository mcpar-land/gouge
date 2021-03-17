export interface IMember {
	user: IUser
	roles: string[]
	premium_since: string
	permissions: string
	pending: boolean
	nick: string | null
	mute: boolean
	joined_at: string
	is_pending: string
	deaf: boolean
}

export interface IUser {
	id: string
	username: string
	avatar: string
	discriminator: string
	public_flags: string
	bot?: boolean
}

export interface IRole {
	id: string
	color: number
	hoist: boolean
	managed: boolean
	mentionable: boolean
	name: string
	permissions: string
	position: number
	tags?: {
		bot_id?: string
	}
}

export interface IChannel {
	id: string
	name: string
	permissions: string
	type: number
}

export function isMember(check: IMember | IUser): check is IMember {
	return (check as IMember).joined_at !== undefined
}
