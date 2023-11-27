import {Node, Loop, Task, Query, QueryAll, Closest} from 'vroum'
import {render} from 'uhtml/keyed'
import {uuid, random} from './utils.js'
import {UI} from './ui.js'
import * as actions from './actions.js'

export class GameLoop extends Loop {
	Board = Query(Board)
	Players = QueryAll(Player)
	Minions = QueryAll(Minion)
	Renderer = Query(Renderer)

	// DOM element to render to
	element = null

	build() {
		return [
			// Player.new({number: 1}),
			// Player.new({number: 2}),
			Board.new(),
			Renderer.new(),
		]
	}

	mount() {
		this.subscribe('start', () => {
			this.Renderer.render()
		})
		this.subscribe('stop', () => {
			console.log('stop!')
			this.Renderer.render()
		})
		this.subscribe('play', () => {
			this.Renderer.render()
		})
		this.subscribe('pause', () => {
			this.Renderer.render()
		})
	}

	destroy() {
		this.query(Renderer).render()
	}

	/**
	 * @typedef {object} Action
	 * @prop {string} type - the name of an action defined in ./actions.js
	 * Any other props with string keys and arbitrary values are also allowed.
	 */

	/**
	 * Runs an action on the game first locally, then broadcasts to other peers (unless disabled)
	 * @arg {Action} action
	 * @arg {Boolean} broadcast  - set to false to disable broadcasting the action to other peers
	 */
	runAction(action, broadcast = true) {
		console.log('runAction', action)

		// run locally
		const handler = actions[action.type]
		if (!handler) throw new Error(`Missing action: ${action.type}`)
		handler(this, action)

		// Send to other parties
		if (broadcast) {
			const socket = this.element.parentElement.lobbyEl.gamesSocket
			socket.send(JSON.stringify(action))
		}
	}
}

class Renderer extends Task {
	Game = Closest(GameLoop)

	tick() {
		this.render()
	}

	render() {
		if (!this.Game?.element) throw new Error('missing DOM element to render to')
		// const start = performance.now()
		render(this.Game.element, UI(this.root))
		// const end = performance.now()
		// console.log(`render time = ${end - start}ms`)
	}
}

export class Player extends Task {
	Game = Closest(GameLoop)
	Minions = QueryAll(Minion)
	Gold = Query(Gold)

	health = 5
	number = 0 // in the context of a single game

	build() {
		return [
			Gold.new(),
			RefillMinions.new(),
			// Minion.new(), Minion.new(), Minion.new(), Minion.new()
		]
	}

	afterCycle() {
		if (this.health <= 0) {
			console.log(`${this.constructor.name} lost`)
			alert(`${this.constructor.name} lost`)
			this.Game.stop()
		}
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
			this.Game.runAction({type: 'addNewMinion', playerId: this.Player.id})
		}
	}
}

export class Minion extends Task {
	// Dependencies
	Game = Closest(GameLoop)
	Player = Closest(Player)
	// Task schedule
	delay = 0
	duration = 0
	interval = 1000
	repeat = Infinity
	// Props
	id = null
	minionType = ''
	cost = 1
	y = -1
	speed = 1
	minionTypes = ['rock', 'paper', 'scissors']

	constructor() {
		super()
		this.id = uuid()
		this.minionType = random(this.minionTypes)
	}

	tick() {
		if (!this.deployed || this.shouldDisconnect) return

		// Check if we need to go up or down.
		const goingUp = this.Player.number === 1
		const startY = goingUp ? 0 : this.Game.Board.height
		const finalY = goingUp ? this.Game.Board.height : 0

		// Fight any enemies on same Y, and remove the loser.
		const opponent = this.Game.Players.find((p) => p !== this.Player)
		if (this.y !== startY && this.y !== finalY) {
			const enemies = opponent.Minions.filter((m) => m.y === this.y)
			for (const enemy of enemies) {
				const loser = this.fight(enemy)
				loser.shouldDisconnect = true
			}
		}

		// If we reached the opposite end, opponent player loses a life, and we leave the board.
		if (this.y === finalY) {
			opponent.health--
			this.shouldDisconnect = true
		} else {
			this.move(goingUp ? 1 : -1)
		}
	}

	afterCycle() {
		if (!this.deployed) return
		if (this.shouldDisconnect) this.disconnect()
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
		console.log(`Player ${this.Player.number} deployed Minion ${this.minionType} on ${this.y}`)
	}

	move(direction = 1) {
		this.y = this.y + this.speed * direction
	}

	/**
	 * Returns the losing minion, if draw return a random winner
	 * @argument {Minion} opponent
	 */
	fight(opponent) {
		console.log('Fight', this.y, `Player ${this.Player.number}`, this.minionType, 'vs', opponent.minionType)
		const winningCombos = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		}
		if (winningCombos[this.minionType] === opponent.minionType) {
			return opponent
		} else if (winningCombos[opponent.minionType] === this.minionType) {
			return this
		} else {
			return random([this, opponent])
		}
	}
}

export class Board extends Node {
	width = 1
	height = 10
}
