import {Node, Loop, Task, Query, QueryAll, Closest} from 'vroum'
import {render, random, uuid} from './utils.js'
import {UI} from './ui.js'

export class GameLoop extends Loop {
	Renderer = Query(Renderer)
	Players = QueryAll(Player)
	Minions = QueryAll(Minion)
	Board = Query(Board)

	constructor(props) {
		super()
		// The DOM element to render to
		this.element = props.element
	}

	build() {
		return [Player.new(), Player.new({ai: true}), Board.new(), Renderer.new()]
	}

	mount() {
		const Renderer = this.Renderer
		this.subscribe('start', () => {
			ui.render()
		})
		this.subscribe('stop', () => {
			ui.render()
		})
		this.subscribe('play', () => {
			ui.render()
		})
		this.subscribe('pause', () => {
			ui.render()
		})
	}

	destroy() {
		this.query(Renderer).render()
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
	health = 3

	constructor(props) {
		super()
		this.ai = props?.ai ?? false
	}

	build() {
		return [Gold.new(), Minion.new(), Minion.new(), Minion.new(), Minion.new(), RefillMinions.new()]
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
	duration = 0
	interval = 3000
	maxAmount = 4
	Player = Closest(Player)

	tick() {
		if (this.Player.Minions?.length < this.maxAmount) {
			this.Player.add(Minion.new())
		}
	}
}

const MINION_TYPES = ['rock', 'paper', 'scissors']

export class Minion extends Task {
	Game = Closest(GameLoop)
	Player = Closest(Player)

	delay = 0
	duration = 0
	interval = 1000
	repeat = Infinity
	// Props
	minionType = ''
	speed = 1
	y = 0
	cost = 1

	constructor() {
		super()
		this.minionType = random(MINION_TYPES)
		this.id = uuid()
	}

	tick() {
		if (!this.deployed || this.shouldDisconnect) return

		// Variables needed to move later.
		const direction = this.Player.ai ? 'down' : 'up'
		const startY = direction === 'down' ? this.Game.Board.height : 0
		const finalY = direction === 'down' ? 0 : this.Game.Board.height

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
			// Else we keep moving.
			this.move(this.Player.ai ? -1 : 1)
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
			console.log(`ACTION deploy', 'You need ${this.cost} gold to deploy this minion`)
			return
		}
		gold.decrement(this.cost)
		this.y = this.Player.ai ? this.Game.Board.height : 0
		this.deployed = this.Game.elapsedTime
		console.log('node minion deploy', this.Player.ai ? 'AI' : 'Player', this.minionType, this.y)
	}

	move(direction = 1) {
		this.y = this.y + this.speed * direction
	}

	/**
	 * Returns the losing minion, if draw return a random winner
	 * @argument {Minion} opponent
	 */
	fight(opponent) {
		const isAI = this.Player.ai
		console.log('ACTION fight', this.y, isAI ? 'AI' : 'Player', this.minionType, 'vs', opponent.minionType)
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
