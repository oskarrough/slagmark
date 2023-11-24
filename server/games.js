/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Party} Party */

/**
 * Games server. This is used to communicate inside a single room/game.
 * @implements {Server}
 */
export default class PartyServer {
	constructor(party) {
		/** @type {Party} */
		this.party = party
	}

	onConnect(conn, ctx) {
		let count = 0
		for (const c of this.party.getConnections()) {
			count++
		}

		conn.send(JSON.stringify({type: 'info', content: `You are Player ${count}`}))
		this.broadcastInfo(`Welcome Player ${count} to ${this.party.id}`)
		this.updateConnections('connect', conn)
	}

	onClose(conn) {
		this.broadcastInfo(`someone left the room ${conn.id}`)
		this.updateConnections('disconnect', conn)
	}

	onMessage(string, conn) {
		// Re-broadcast incoming messages to all other open connections (players).
		conn.send(JSON.stringify({type: 'info', content: `you just sent: ${string}`}))
		this.party.broadcast(string, [conn.id])
		// const msg = JSON.parse(string)
		// if (msg.type === 'deployMinion') {}
		// if (msg.type === 'create') {}
	}

	async updateConnections(type, connection) {
		const lobbyRoom = this.party.context.parties.main.get('lobby')
		await lobbyRoom.fetch({
			method: 'POST',
			body: JSON.stringify({type, connectionId: connection.id, roomId: this.party.id}),
		})
	}

	broadcastInfo(content, excludelist = []) {
		this.party.broadcast(JSON.stringify({type: 'info', content}), excludelist)
	}
}
