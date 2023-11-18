/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Party} Party */

/**
 * @implements {Server}
 */
export default class PartyServer {
	constructor(party) {
		/** @type {Party} */
		this.party = party
	}

	onConnect(conn, ctx) {
		// const msg = {type: 'info', message: `${conn.id} joined game ${this.party.id}`}
		// this.party.broadcast(JSON.stringify(msg))
		this.updateConnections('connect', conn)
	}

	async onMessage(websocketMessage, sender) {
		const event = JSON.parse(websocketMessage)
		console.log('lobby server:message', this.party.id, event)
	}

	onClose(conn) {
		console.log('lobby server:close')
		// const msg = {type: 'leave', connId: conn.id, roomId: this.party.id}
		// this.party.broadcast(JSON.stringify(msg))
		this.updateConnections('disconnect', conn)
	}

	async updateConnections(type, connection) {
		const connectionsRoom = this.party.context.parties.whatever.get('active-connections')
		await connectionsRoom.fetch({
			method: 'POST',
			body: JSON.stringify({type, connectionId: connection.id, roomId: this.party.id}),
		})
	}
}
