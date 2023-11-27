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

		// new game
		if (count === 1) {}

		if (count > 2) {
			this.broadcastInfo('Game is already full, sorry!')
			return
		}

		const player = {
			id: conn.id, 
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

		console.log('onConnect', this.players.length, 'players', 'count', count)
		this.players.push(player)
		this.party.broadcast(
			JSON.stringify({type: 'playerConnected', playerId: player.id, players: this.players}),
		)

		if (count === 2) {
			// this is when the gameplay can begin
			this.party.broadcast(JSON.stringify({type: 'startGameCountdown'}))
		}
	}

	onClose(conn) {
		this.broadcastInfo(`Bye! ${conn.id} left the room`)
		this.updateConnections('disconnect', conn)
		const playerIndex = this.players.findIndex((p) => p.id === conn.id)
		if (playerIndex !== 0) this.players.splice(playerIndex, 1)
		this.party.broadcast(
			JSON.stringify({type: 'playerDisconnected', playerId: conn.id, players: this.players}),
		)
	}

	onMessage(string, conn) {
		// Re-broadcast incoming messages to all other open connections (players).
		this.party.broadcast(string, [conn.id])
		// await this.party.storage.put(`${conn.id}`, string)
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
