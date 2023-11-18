/** @typedef {import("partykit/server").Party} Party */
/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */

/**
 * @implements {Server}
 */
export default class PartyServer {
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
		console.log(`Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`)
		this.updatePresence()
	}

	onClose() {
		this.updatePresence()
	}

	onError() {
		this.updatePresence()
	}

	/**
	 * @param {string} messageString
	 * @param {Connection} sender
	 */
	onMessage(messageString, sender) {
		const message = JSON.parse(messageString)
		// console.log('server got', message)
		if (message?.pointer) {
			const msg = {
				type: 'cursorUpdate',
				id: sender.id,
				...message,
				// lastUpdate: Date.now(),
			}
			this.party.broadcast(JSON.stringify(msg), [sender.id])
		} else {
			const msg = {type: 'cursorRemove', id: sender.id}
			this.party.broadcast(JSON.stringify(msg), [sender.id])
		}
	}

	updatePresence() {
		const count = Array.from(this.party.getConnections()).length
		const msg = {type: 'presence', count}
		this.party.broadcast(JSON.stringify(msg))
	}

	// async onRequest(req) {
	// 	if (req.method === 'POST') {
	// 		const body = await req.json()
	// 		return new Response(JSON.stringify(body), {
	// 			status: 200,
	// 			headers: {'Content-Type': 'application/json'},
	// 		})
	// 	}
	// 	return new Response('Not found', {status: 404})
	// }
}
