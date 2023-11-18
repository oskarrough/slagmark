/** @typedef {import("partykit/server").Party} Party */
/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */

/**
 * @implements {Server}
 */
export default class Rooms {
	connections = {}

	constructor(party) {
		/** @type {Party} */
		this.party = party
	}

	onConnect(connection ) {
		connection.send(JSON.stringify(this.connections))
	}

	async onRequest(request) {
		// read from storage
		this.connections = this.connections ?? (await this.party.storage.get('connections')) ?? {}
		// update connection count
		if (request.method === 'POST') {
			/** @type {{type, connectionId, roomId}} */
			const update = await request.json()
			const count = this.connections[update.roomId] ?? 0
			if (update.type === 'connect') this.connections[update.roomId] = count + 1
			if (update.type === 'disconnect') this.connections[update.roomId] = Math.max(0, count - 1)

			// notify any connected listeners
			this.party.broadcast(JSON.stringify(this.connections))

			// save to storage
			await this.party.storage.put('connections', this.connections)
		}

		// send connection counts to requester
		return new Response(JSON.stringify(this.connections))
	}
}
