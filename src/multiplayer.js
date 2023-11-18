import PartySocket from 'partysocket'

export const PARTYKIT_URL =
	import.meta.env.MODE === 'production'
		? 'https://webrumble-party.oskarrough.partykit.dev'
		: 'http://localhost:1999'

// https://docs.partykit.io/reference/partysocket-api/
export const socket = new PartySocket({
	host: PARTYKIT_URL,
	// See partykit.json for the mapping
	party: 'main',
	room: 'lobby',
})
