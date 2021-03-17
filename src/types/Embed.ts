export interface IEmbed {
	title?: string
	description?: string
	url?: string
	timestamp?: string
	color?: number
	footer?: {
		text: string
		icon_url?: string
		proxy_icon_url?: string
	}
	image?: IEmbedMedia
	thumbnail?: IEmbedMedia
	video?: IEmbedMedia
	provider?: { name?: string; url?: string }
	author?: {
		name?: string
		url?: string
		icon_url?: string
		proxy_icon_url?: string
	}
	fields?: {
		name: string
		value: string
		inline?: boolean
	}[]
}

export interface IEmbedMedia {
	url?: string
	proxy_url?: string
	height?: number
	width?: number
}
