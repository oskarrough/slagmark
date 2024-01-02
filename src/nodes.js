import {Node, Loop, Task, Query, QueryAll, Closest} from 'vroum'
import * as actions from './actions.js'
import {Logger} from './stdlib/logger.js'
import {Renderer} from './stdlib/renderer.js'
import {Minion} from './nodes/minion.js'
import {Player, Gold, RefillMinions} from './nodes/player.js'

/** @typedef {import('./actions.js').Action} Action */

export class GameLoop extends Loop {
	Board = Query(Board)
	Players = QueryAll(Player)
	Minions = QueryAll(Minion)
	Renderer = Query(Renderer)
	Logger = Query(Logger)

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
			// Players are (now) inserted once a client connects to the game.
			// Player.new({number: 1}),
			// Player.new({number: 2}),
			Board.new(),
			Renderer.new(),
			Logger.new(),
		]
	}

	mount() {
		this.Logger.push({type: 'mount'})
	}

	// shortcut for this.subscribe('start', fn)
	$start = () => {
		this.Logger.push({type: 'start'})
	}
	$stop = () => {
		this.Logger.push({type: 'stop'})
		this.Renderer.tick()
	}
	$play = () => {
		this.Logger.push({type: 'play'})
	}
	$pause = () => {
		this.Logger.push({type: 'pause'})
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
		handler(this, action)

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

		this.Logger.push(action)
	}
}

export class Board extends Node {
	width = 1
	height = 10
}

/** Used for the initial countdown before a game starts */
export class GameStartCountdown extends Task {
	Game = Closest(GameLoop)

	/** @type {string|number} */
	count = null

	delay = 1000
	duration = 0
	interval = 1000
	repeat = 4 // put it on higher than you'd like because of the "delay"

	tick() {
		this.count = this.repeat - 1 - this.cycles
		if (this.count > 0) {
			// count
		} else {
			// final tick
			this.Game.Players.forEach((player) => {
				player.add(Gold.new())
				player.add(RefillMinions.new())
			})
		}
	}
}
