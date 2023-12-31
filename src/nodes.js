import {Node, Loop, Task, Query, QueryAll, Closest} from 'vroum'
import {uuid, random} from './stdlib/utils.js'
import * as actions from './actions.js'
import {Logger} from './stdlib/logger.js'
import {Renderer} from './stdlib/renderer.js'
import {beep} from './stdlib/audio.js'

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

export class Player extends Task {
	Game = Closest(GameLoop)
	Minions = QueryAll(Minion)
	Gold = Query(Gold)

	health = 3
	number = 0 // used to determine who is above, who is below on the slagmark

	afterCycle() {
		if (this.health <= 0) {
			const gameOverAction = {type: 'gameOver', serializedPlayer: this.serialize()}
			this.Game.runAction(gameOverAction)
		}
	}

	serialize() {
		const {id, number, health} = this
		return {id, number, health, gold: this.Gold?.amount}
	}
}

export class AIPlayer extends Player {
	build() {
		this.id = uuid()

		return [
			// Gold.new(),
			// By letting this create the minions, it goes through websockets..
			RefillMinions.new(),
			DeployRandomMinion.new(),
		]
	}

	mount() {
		console.log('ai was mounted')
	}
}

export class Gold extends Task {
	duration = 0
	interval = 1000

	amount = 0
	maxAmount = 10

	tick() {
		this.increment()
	}

	increment(value = 1) {
		if (this.amount === this.maxAmount) return
		this.amount = this.amount + value
	}

	decrement(value = 1) {
		if (this.amount < 2) return 0
		this.amount = this.amount - value
	}
}

/** Adds a new minion to the parent every {interval} seconds (if we have less than 4) */
export class RefillMinions extends Task {
	Game = Closest(GameLoop)
	Player = Closest(Player)

	duration = 0
	interval = 3000
	maxAmount = 4

	tick() {
		const undeployedMinions = this.Player.Minions.filter((m) => !m.deployed)?.length
		if (undeployedMinions < this.maxAmount) {
			this.Game.runAction({type: 'createMinion', playerId: this.Player.id, minionType: random(MINION_TYPES)})
		}
	}
}

export const MINION_TYPES = ['rock', 'paper', 'scissors']

export class Minion extends Task {
	Game = Closest(GameLoop)
	Player = Closest(Player)

	id = null
	minionType = ''
	cost = 2
	y = -1
	defaultSpeed = 1.5
	minionTypes = MINION_TYPES
	// if true, it'll be removed after next tick
	shouldDisconnect = false

	get speed() {
		const s = this.defaultSpeed
		if (this.minionType === 'rock') return s * 0.8
		if (this.minionType === 'paper') return s * 1.2
		return s
	}

	constructor() {
		super()
		this.id = uuid()
		this.minionType = random(this.minionTypes)
	}

	/* @param {Minion} enemy */
	shouldFight(enemy) {
		const bufferZone = 0.5
		return !this.query(Fight) && !enemy.query(Fight) && Math.abs(this.y - enemy.y) <= bufferZone
	}

	tick() {
		if (!this.deployed || this.shouldDisconnect) return

		// Decide if we need to go up or down.
		const goingUp = this.Player.number === 1
		const startY = goingUp ? 0 : this.Game.Board.height
		const finalY = goingUp ? this.Game.Board.height : 0

		// Fight any enemies on same Y, and remove the loser.
		const opponent = this.Game.Players.find((p) => p !== this.Player)
		if (this.y !== startY && this.y !== finalY) {
			const enemies = opponent.Minions.filter((m) => this.shouldFight(m))
			for (const enemy of enemies) {
				this.add(Fight.new({enemy}))
			}
		}

		const reachedOppositeEnd = (goingUp && this.y >= finalY) || (!goingUp && this.y <= finalY)
		const fighting = this.query(Fight)

		// If not fighting or reached the end, we assume the minion is moving.
		if (!fighting && !reachedOppositeEnd) {
			this.move(goingUp ? 1 : -1)
		} else if (reachedOppositeEnd) {
			this.Game.runAction({type: 'minionReachedEnd', minionId: this.id, opponentPlayerId: opponent.id})
		}
	}

	afterCycle() {
		if (this.deployed && this.shouldDisconnect) this.disconnect()
	}

	/** Deploys to the starting side of the parent Player's board. */
	deploy() {
		const gold = this.Player.Gold
		if (gold.amount < this.cost) {
			console.log(`You need ${this.cost} gold to deploy this minion`)
			return
		}
		gold.decrement(this.cost)
		this.y = this.Player.number === 1 ? 0 : this.Game.Board.height
		this.deployed = this.Game.elapsedTime
		beep('bleep-26.wav')
	}

	move(direction = 1) {
		const D = this.Game.deltaTime / 1000
		this.y += this.speed * D * direction
	}
}

export class Fight extends Task {
	delay = 0
	duration = 0
	// interval = 0
	repeat = 1

	Minion = Closest(Minion)

	/** @type {Minion} */
	enemy = null

	mount() {
		console.log('fight mount', this.Minion?.minionType, 'vs', this.enemy?.minionType, this)
		if (!this.parent) {
			console.log('this should not happen', this)
			this.disconnect()
			return
		}
		// if (this.enemy) this.enemy.add(Fight.new())
		// beep('bleep-29.wav')
	}

	tick() {
		console.log('fight tick', this.Minion.y, this.Minion.minionType, 'vs', this.enemy?.minionType)
	}

	afterCycle() {
		console.log('fight afterCycle', this.Minion.y, this.Minion.minionType, 'vs', this.enemy?.minionType)
		if (this.enemy) {
			const loser = this.fight()
			this.Minion.Game.runAction({
				type: 'minionFight',
				loserId: loser.id,
				minionId: this.Minion.id,
				enemyId: this.enemy.id,
			})
		}
	}

	/**
	 * Returns the losing minion, if tie it picks a random loser
	 */
	fight() {
		const minion = this.Minion
		const enemy = this.enemy
		if (!enemy) throw new Error('missing enemy')
		console.log('fight fight', minion.y, minion.minionType, 'vs', enemy.minionType)
		const winningCombos = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		}
		if (winningCombos[this.Minion.minionType] === enemy.minionType) {
			return enemy
		} else if (winningCombos[enemy.minionType] === this.Minion.minionType) {
			return this
		} else {
			return random([this, enemy])
		}
	}
}

/** Used for the initial countdown before a game starts */
export class GameCountdown extends Task {
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

class DeployRandomMinion extends Task {
	Player = Closest(Player)
	delay = 0
	interval = 2200
	duration = 0

	tick() {
		const gold = this.Player.Gold?.amount
		const minions = this.Player.Minions.filter((m) => m instanceof Minion).filter(
			(m) => !m.deployed && m.cost <= gold,
		)
		const minion = random(minions)
		if (minion) {
			this.Player.Game.runAction({type: 'deployMinion', minionId: minion?.id})
		}
	}
}
