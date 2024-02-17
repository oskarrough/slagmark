import {Loop, Query, QueryAll} from 'vroum'
import * as actions from '../actions.js'
import {Logger} from '../stdlib/logger.js'
import {Renderer} from '../stdlib/renderer.js'
import {Minion} from '../nodes/minion.js'
import {Player} from '../nodes/player.js'
import {Board} from './board.js'

/** @typedef {import('../actions.js').Action} Action */

export class GameLoop extends Loop {
	Board = Query(Board)
	Players = QueryAll(Player)
	Minions = QueryAll(Minion)
	Renderer = Query(Renderer)

	// DOM element to render to
	element = null

	// Also known as the websocket connection id.
	playerId = null
	player1 = null
	player2 = null

	// Inidicator for the UI when to switch scene
	gameOver = false

	// the "serialized" player that lost
	loser = null

	build() {

		return [
			// You could insert new players here, but we do it via websockets once a client connects.
			// Player.new({number: 1}),
			Board.new(),
			Renderer.new(),
		]
	}

	mount() {
		this.logger = new Logger()
		this.logger.push({type: 'gameCreated'})
	}

	// shortcut for this.subscribe('start', fn)
	$start = () => {
		this.logger.push({type: 'gameStart'})
	}
	$stop = () => {
		this.logger.push({type: 'gameStop'})
		this.Renderer.tick()
	}
	$play = () => {
		this.logger.push({type: 'gamePlay'})
	}
	$pause = () => {
		this.logger.push({type: 'gamePause'})
		this.Renderer.tick()
	}

	destroy() {
		this.Renderer.tick()
	}

	/**
	 * Runs an action on the game first locally, then broadcasts to other peers (unless disabled)
	 * @arg {Action} action
	 * @arg {Boolean} broadcast - set to false to disable broadcasting the action to other peers
	 */
	runAction(action, broadcast = true) {
		console.log('action', action)

		// run locally
		const handler = actions[action.type]
		if (!handler) throw new Error(`Missing action: ${action.type}`)
		const result = handler(this, action)

		// Send to other parties
		if (broadcast) {
			const socket = this.element.parentElement.lobbyEl.gamesSocket
			try {
				const msg = JSON.stringify(action)
				socket.send(msg)
			} catch (err) {
				console.log(err, action)
			}
		}

		this.logger.push(action, result)
	}
}
