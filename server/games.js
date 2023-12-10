import {random, uuid} from '../src/stdlib/utils'

/** @typedef {import('partykit/server').Server} Server */
/** @typedef {import('partykit/server').Party} Party */

/**
 * Games server. This is used to communicate inside a single room/game.
 * @implements {Server}
 */
export default class PartyServer {
	constructor(party) {
		/** @type {Party} */
		this.party = party

		/** @type {Map<string, import('../src/actions').InitialPlayer>} */
		this.players = new Map()
	}

	onConnect(conn, ctx) {
		this.updateConnections('connect', conn)

		if (this.players.size > 2) return this.broadcastInfo('Game is already full, sorry!')

		// Add new player
		const player = this.createPlayer(conn.id)
		this.players.set(conn.id, player)

		// Notify everyone
		const msg = JSON.stringify({
			type: 'playerConnected',
			playerId: player.id,
			players: Array.from(this.players.values()),
		})
		this.party.broadcast(msg)
		// conn.send(JSON.stringify({type: 'info', content: `You are player ${player.number}`})

		// Start countdown once game is full
		if (this.players.size === 2) {
			this.party.broadcast(JSON.stringify({type: 'startGameCountdown'}))
		}

		// conn.send(JSON.stringify({type: 'info', content: `You are Player ${player.number}, ${player.id}`}))
		// this.broadcastInfo(`Player ${player.number} joined ${this.party.id}`)
	}

	onClose(conn) {
		this.updateConnections('disconnect', conn)
		this.players.delete(conn.id)
		// Notify everyone
		this.broadcastInfo(`Bye! ${conn.id} left the room`)
		const msg = JSON.stringify({type: 'playerDisconnected', playerId: conn.id, players: this.players})
		this.party.broadcast(msg)
	}

	onMessage(string, conn) {
		// Re-broadcast incoming messages to all other open connections (players).
		this.party.broadcast(string, [conn.id])
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

	/**
	 * A data-representation of a player. Not the real node.
	 * @param {string} id
	 * @returns {import('../src/actions').InitialPlayer}
	 */
	createPlayer(id) {
		return {
			id,
			number: this.players.size + 1,
			minions: Array(4)
				.fill()
				.map((_) => {
					return {
						id: uuid(),
						minionType: random(['rock', 'paper', 'scissors']),
					}
				}),
		}
	}
}
