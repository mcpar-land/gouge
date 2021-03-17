export function apiUrl(appId: string, extension: string): string {
	let e = extension.charAt(0) == '/' ? extension : '/' + extension

	return 'https://discord.com/api/v8/applications/' + appId + e
}
