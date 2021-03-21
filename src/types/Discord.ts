/**
 * Representation of the Discord API
 * [Member Object](https://discord.com/developers/docs/resources/guild#guild-member-object)
 */
export interface IMember {
	/** the user this guild member represents */
	user: IUser
	/** array of role object ids */
	roles: string[]
	/**	when the user started boosting the guild */
	premium_since: string
	/**	total permissions of the member in the channel, including overrides, returned when in the interaction object */
	permissions: string
	/** whether the user has not yet passed the guild's Membership Screening requirements */
	pending: boolean
	/** this users guild nickname */
	nick: string | null
	/** whether the user is muted in voice channels */
	mute: boolean
	/** when the user joined the guild */
	joined_at: string
	/** whether the user has not yet passed the guild's Membership Screening requirements */
	is_pending: string
	/** whether the user is deafened in voice channels */
	deaf: boolean
}

/**
 * Representation of the Discord API
 * [User Object](https://discord.com/developers/docs/resources/user#user-object)
 */
export interface IUser {
	/** the user's id */
	id: string
	/** the user's username, not unique across the platform */
	username: string
	/** the user's [avatar hash](https://discord.com/developers/docs/reference#image-formatting) */
	avatar: string
	/** the user's 4-digit discord-tag */
	discriminator: string
	/** the public [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags) on a user's account */
	public_flags: string
	/** whether the user belongs to an OAuth2 application */
	bot?: boolean
}

/**
 * Representation of the Discord API
 * [Role Object](https://discord.com/developers/docs/topics/permissions#role-object)
 */
export interface IRole {
	/** role id */
	id: string
	/** integer representation of hexadecimal color code */
	color: number
	/** if this role is pinned in the user listing */
	hoist: boolean
	/**	whether this role is managed by an integration */
	managed: boolean
	/** whether this role is mentionable */
	mentionable: boolean
	/** role name */
	name: string
	/** permission bit set */
	permissions: string
	/** position of this role */
	position: number
	/** the tags this role has */
	tags?: {
		bot_id?: string
		integration_id?: string
		premium_subscriber?: null
	}
}

/**
 * Representation of the Discord API
 * [Channel Types](https://discord.com/developers/docs/resources/channel#channel-object-channel-types)
 */
export enum ChannelType {
	/** a text channel within a server */
	GUILD_TEXT = 0,
	/** a direct message between users */
	DM = 1,
	/** a voice channel within a server */
	GUILD_VOICE = 2,
	/** a direct message between multiple users */
	GROUP_DM = 3,
	/** an organizational category that contains up to 50 channels */
	GUILD_CATEGORY = 4,
	/** a channel that users can follow and crosspost into their own server */
	GUILD_NEWS = 5,
	/** a channel in which game developers can sell their game on Discord */
	GUILD_STORE = 6,
}

/**
 * Representation of the Discord api
 * [Channel Object](https://discord.com/developers/docs/resources/channel#channel-object)
 */
export interface IChannel {
	/** the id of this channel */
	id: string
	/** the type of channel */
	type: ChannelType
	/** the name of the channel (2-100 characters) */
	name: string
	/** explicit permission overwrites for members and roles */
	permissions: string
	/** the channel topic (0-1024 characters) */
	topic?: string
	/** whether the channel is nsfw */
	nsfw?: boolean
}

/** Type-safe check to determine if an input is an [[IMember]] or an [[IUser]].
 * The most common use for this is [[Command.user]], which adds an
 * `IMember | IUser` to the handler's argument array. When a command is used in
 * a direct DM with your bot, it will return IUser. When used in a guild, it will
 * return IMember.
 */
export function isMember(check: IMember | IUser): check is IMember {
	return (check as IMember).joined_at !== undefined
}
