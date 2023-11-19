import PartySocket from 'partysocket'

/**
 * To make everything multiplayer we use PartyKit.io,
 * which is basically websocket servers with persistance deployed to Cloudflare.
 *
 * We have two servers (or parties): main and games.
 *  - main has one room "lobby" room
 *  - games has one room per game (random id)
 *
 */

export const PARTYKIT_URL =
	import.meta.env.MODE === 'production'
		? 'https://rumble.oskarrough.partykit.dev'
		: 'http://localhost:1999'

// https://docs.partykit.io/reference/partysocket-api/
export const socket = new PartySocket({
	host: PARTYKIT_URL,
	// See partykit.json for the mapping
	party: 'main',
	room: 'lobby',
})

// Making sure all messages are caught somewhere.
socket.addEventListener('message', (event) => {
	const msg = JSON.parse(event.data)
	if (msg.type === 'presence') {
		// window.rumblepresence = msg.count // initial count to live-presence
		// handled by <live-presence>
	} else if (msg.type === 'cursorUpdate') {
		// handled by <live-cursors>
	} else if (msg.type === 'connections') {
		// handled by <rumble-lobby>	
	} else {
		console.log('main socket unhandled message', msg)
	}
})
