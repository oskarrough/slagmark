/* eslint-env browser */

// @ts-check
// Optional JS type checking, powered by TypeScript.
/** @typedef {import("partykit/server").Party} Party */
/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */

/**
 * @implements {Server}
 */
class PartyServer {
	/**
	 * @param {Party} party - The Party object.
	 */
	constructor(party) {
		/** @type {Party} */
		this.party = party
	}

	/**
	 * @param {Connection} conn - The connection object.
	 * @param {ConnectionContext} ctx - The context object.
	 */
	onConnect(conn, ctx) {
		// A websocket just connected!
		console.log(
			`Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`,
		)

		const connections = []
		for (const c of this.party.getConnections()) {
			connections.push(c)
		}

		// Send a message to the connection
		conn.send(
			JSON.stringify({type: 'welcome', connections: connections.length}),
		)
	}

	/**
	 * @param {string} messageString
	 * @param {Connection} sender
	 */
	onMessage(messageString, sender) {
		const message = JSON.parse(messageString)
		console.log('server got', message)

		if (message?.pointer) {
			const cursor = JSON.stringify({
				id: sender.id,
				type: 'cursorUpdate',
				lastUpdate: Date.now(),
				...message,
			})
			// Broadcast the received message to all other connections in the room except the sender
			this.party.broadcast(cursor)
			// for (const conn of this.party.getConnections()) {
			// 	if (conn.id !== sender.id) {
			// 		// conn.send(JSON.stringify(msg))
			// 		conn.send(JSON.stringify({type: 'yolo', msg: 'hello'}))
			// 	}
			// }
			// this.party.broadcast(JSON.stringify(msg), [sender.id])
		}
	}

	/* async onRequest(req) {
		if (req.method === 'POST') {
			const body = await req.json()
			return new Response(JSON.stringify(body), {
				status: 200,
				headers: {'Content-Type': 'application/json'},
			})
		}

		return new Response('Not found', {status: 404})
	} */
}

export default PartyServer
