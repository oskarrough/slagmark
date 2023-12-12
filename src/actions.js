import {Player, AIPlayer, Minion, GameCountdown} from './nodes.js'

/**
 * All "action" functions exported here follow a few rules:
 *
 * They accept two arguments:
 * 1) the Game loop 2) an Action object.
 *
 * They can modify the game all they want.
 *
 * They can not do anything random. Sorry. For randomthings, send it with the action object.
 */

/** @typedef {import('./nodes.js').GameLoop} Game */

/**
 * @template T
 * @typedef {{ type: string } & T} Action
 */

/** @typedef {{id: string, number: number, minions: InitialMinion[]}} InitialPlayer */
/** @typedef {{id: string, minionType: string}} InitialMinion */

/**
 * Called when a client connects to websockets.
 * @param {Game} game
 * @param {Action<{playerId: string, players: InitialPlayer[]}>} action
 */
export function playerConnected(game, action) {
	for (const player of action.players) {
		// If already in game, skip
		if (game.Players.find((p) => p.id === player.id)) continue
		// ...else create a new player, with minions.
		const p = Player.new({id: player.id, number: player.number})
		for (const {id, minionType} of player.minions) {
			p.add(Minion.new({id, minionType}))
		}
		game.add(p)
	}
}

/**
 * Called when a client disconnects websockets.
 * @param {Game} game
 * @param {Action<{playerId: string, players: InitialPlayer[]}>} action
 */
export function playerDisconnected(game, action) {
	const player = game.Players.find((player) => player.id === action.playerId)
	player?.disconnect()
}

/**
 * Adds a new minion to a player
 * @param {Game} game
 * @param {Action<{playerId: string, minionType: string}>} action
 */
export function createMinion(game, action) {
	const player = game.Players.find((player) => player.id === action.playerId)
	const minion = Minion.new()
	minion.minionType = action.minionType
	player.add(minion)
}

/**
 * Deploys a minion to the slagmark.
 * @param {Game} game
 * @param {Action<{id: string}>} action
 */
export function deployMinion(game, action) {
	const minion = game.Minions.find((m) => m.id === action.id)
	minion?.deploy()
}

/**
 * @param {Game} game
 */
export function startGameCountdown(game, action) {
	const countdown = GameCountdown.new({repeat: action.countFrom || 4})
	game.add(countdown)
}


/**
 * @param {Game} game
 * @param {Action<{serializedPlayer: {id: string, number: number, health: number, gold: number}}>} action
 */
export function gameOver(game, action) {
	game.loser = action.serializedPlayer
	const msg = `Player ${game.loser.number} (${game.loser.id}) lost!`
	console.log(msg)
	game.gameOver = true
	game.pause()
}

// does this sync pauses?!
export function stop(game) {
	game.pause()
}

export function spawnAI(game) {
	game.add(AIPlayer.new({number: 2}))
	game.runAction({type: 'startGameCountdown', countFrom: 1})
	// number: this.players.size + 1,
}
