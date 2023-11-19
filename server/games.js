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
		this.updateConnections('connect', conn)
	}

	onClose(conn) {
		this.updateConnections('disconnect', conn)
	}

	async updateConnections(type, connection) {
		const lobbyRoom = this.party.context.parties.main.get('lobby')
		await lobbyRoom.fetch({
			method: 'POST',
			body: JSON.stringify({type, connectionId: connection.id, roomId: this.party.id}),
		})
	}
}
