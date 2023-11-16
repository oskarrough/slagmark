import PartySocket from 'partysocket'

// Connect to the websocket server.
const PARTYKIT_URL =
	import.meta.env.MODE === 'production'
		? 'https://webrumble-party.oskarrough.partykit.dev'
		: 'http://localhost:1999'

// Connect everyone to the same room for now.
const ROOM_ID = 'my-room' //uuid()

// https://docs.partykit.io/reference/partysocket-api/
export const socket = new PartySocket({
	host: PARTYKIT_URL,
	room: ROOM_ID,
	// party: 'main'
})

