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
		conn.send(JSON.stringify({info: `welcome you are number ${count}`}))
		this.updateConnections('connect', conn)
	}

	onClose(conn) {
		this.updateConnections('disconnect', conn)
	}

	onMessage(string, conn) {
		const msg = JSON.parse(string)
		console.log('games server message', msg)
		this.party.broadcast(string, [conn.id])
		// if (msg.type === 'deployMinion') {
		// 	console.log('deplooooooy')
	}

	async updateConnections(type, connection) {
		const lobbyRoom = this.party.context.parties.main.get('lobby')
		await lobbyRoom.fetch({
			method: 'POST',
			body: JSON.stringify({type, connectionId: connection.id, roomId: this.party.id}),
		})
	}
}
