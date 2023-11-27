import {Player, Minion} from './nodes.js'

// The 'action' here a kind of serialized mini-version of the game state to get started.
// We turn it into real nodes here.
export function playerConnected(game, action) {
	action.players.forEach((miniPlayer) => {
		if (game.Players.find((p) => p.id === miniPlayer.id)) return
		const player = Player.new({id: miniPlayer.id, number: miniPlayer.number})
		miniPlayer.minions.forEach((miniMinion) => {
			player.add(Minion.new({id: miniMinion.id, minionType: miniMinion.minionType}))
		})
		game.add(player)
	})
}

/**
 * @param {*} game
 * @param {{id: string}} action
 */
export function deployMinion(game, action) {
	const minion = game.Minions.find((m) => m.id === action.id)
	minion?.deploy()
}

/**
 * @param {*} game
 * @param {{playerId: string}} action
 */
export function addNewMinion(game, action) {
	const player = game.Players.find((player) => player.id === action.playerId)
	const minion = Minion.new()
	player.add(minion)
}

/**
 * @param {*} game
 * @param {{playerId: string, players: []}} action
 */
export function playerDisconnected(game, action) {
	const player = game.Players.find((player) => player.id === action.playerId)
	player.disconnect()
}
