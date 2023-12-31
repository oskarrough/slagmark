import PartySocket from 'partysocket'

/**
 * To make everything multiplayer we use partykit.io,
 * which is basically websocket servers with persistance deployed to Cloudflare.
 *
 * We have two servers (or parties): lobby and games.
 *  - lobby has one room "lobby" room
 *  - games has one room per game (random id)
 */

export const PARTYKIT_URL =
	import.meta.env.MODE === 'production' ? 'https://slagmark.oskarrough.partykit.dev' : 'http://localhost:1999'

// https://docs.partykit.io/reference/partysocket-api/
export const lobbySocket = new PartySocket({
	host: PARTYKIT_URL,
	party: 'main', // maps to server/lobby.js in partykit.json
	room: 'lobby',
})
