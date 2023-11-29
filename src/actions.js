import {Player, Minion, Countdown} from './nodes.js'

/**
 * @typedef {import('./nodes.js').GameLoop} Game
 */

/**
 * @typedef {object} Action
 * @prop {string} type - the snakeCase name of an action defined in ./actions.js
 * Other props also allowed
 */

/**
 * @typedef {object} InitialPlayer
 * @prop {string} id
 * @prop {Number} number
 * @prop {InitialMinion[]} minions
 */

/**
 * @typedef {object} InitialMinion
 * @prop {string} id
 * @prop {string} minionType
 */

/**
 * @typedef {object} PlayerConnectedAction
 * @prop {string} type
 * @prop {string} playerId
 * @prop {InitialPlayer[]} players
 */

/**
 * @typedef {object} PlayerDisconnectedAction
 * @prop {string} type
 * @prop {string} playerId
 * @prop {InitialPlayer[]} players
 */

/**
 * The 'action' here a kind of serialized mini-version of the game state to get started.
 * We turn it into real nodes here.
 * @param {Game} game
 * @param {PlayerConnectedAction} action
 */
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
 * @param {Game} game
 * @param {PlayerDisconnectedAction} action
 */
export function playerDisconnected(game, action) {
	const player = game.Players.find((player) => player.id === action.playerId)
	player.disconnect()
}

/**
 * @param {Game} game
 * @param {{id: string}} action
 */
export function deployMinion(game, action) {
	const minion = game.Minions.find((m) => m.id === action.id)
	minion?.deploy()
}

/**
 * @param {Game} game
 * @param {{playerId: string}} action
 */
export function addNewMinion(game, action) {
	const player = game.Players.find((player) => player.id === action.playerId)
	const minion = Minion.new()
	player.add(minion)
}

/**
 * @param {Game} game
 * @param {{playerId: string, players: []}} action
 */
export function startGameCountdown(game, action) {
	const countdown = Countdown.new()
	game.add(countdown)
}
