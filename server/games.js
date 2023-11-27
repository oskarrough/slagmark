import {random, uuid} from '../src/utils'

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
		this.players = []
	}

	onConnect(conn, ctx) {
		let count = 0
		for (const c of this.party.getConnections()) {
			count++
		}

		this.updateConnections('connect', conn)
		conn.send(JSON.stringify({type: 'info', content: `You are Player ${count}`}))
		this.broadcastInfo(`Welcome Player ${count} to ${this.party.id}`, [conn.id])

		if (count > 2) {
			this.broadcastInfo('Game is already full, sorry!')
			return
		}

		const player = {
			id: conn.id, // uuid()
			number: count,
			minions: Array(4)
				.fill()
				.map((_) => {
					return {
						id: uuid(),
						minionType: random(['rock', 'paper', 'scissors']),
					}
				}),
		}
		console.log(this.players.length, 'players')
		this.players.push(player)
		this.party.broadcast(JSON.stringify({type: 'playerConnected', players: this.players}))
	}

	onClose(conn) {
		this.broadcastInfo(`someone left the room ${conn.id}`)
		this.updateConnections('disconnect', conn)
	}

	onMessage(string, conn) {
		const msg = JSON.parse(string)

		if (msg.type === 'newGame') {
		} else {
			// Re-broadcast incoming messages to all other open connections (players).
			this.party.broadcast(string, [conn.id])
		}
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
