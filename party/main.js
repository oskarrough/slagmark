/** @typedef {import("partykit/server").Party} Party */
/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */

/**
 * @implements {Server}
 */
export default class PartyServer {
	connections = {}

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
		conn.send(JSON.stringify({type: 'connections', connections: this.connections}))
		this.updatePresence()
	}

	onClose() {
		this.updatePresence()
	}

	/**
	 * @param {string} messageString
	 * @param {Connection} sender
	 */
	onMessage(messageString, sender) {
		const message = JSON.parse(messageString)
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

	async onRequest(request) {
		// read from storage
		this.connections = this.connections ?? (await this.party.storage.get('connections')) ?? {}
		console.log('we here')
		// update connection count
		if (request.method === 'POST') {
			/** @type {{type, connectionId, roomId}} */
			const update = await request.json()
			const count = this.connections[update.roomId] ?? 0
			if (update.type === 'connect') this.connections[update.roomId] = count + 1
			if (update.type === 'disconnect') {
				if (count === 1) {
					delete this.connections[update.roomId]
				} else {
					this.connections[update.roomId] = Math.max(0, count - 1)
				}
			}

			const msg = JSON.stringify({type: 'connections', connections: this.connections})

			// notify any connected listeners
			this.party.broadcast(msg)

			// save to storage
			await this.party.storage.put('connections', this.connections)
		}

		// send connection counts to requester
		return new Response(JSON.stringify({type: 'connections', connections: this.connections}))
	}

	updatePresence() {
		const count = Array.from(this.party.getConnections()).length
		const msg = {type: 'presence', count}
		this.party.broadcast(JSON.stringify(msg))
	}
}
