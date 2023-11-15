import {Node, Loop, Task} from 'vroum/core'
import {render, random} from './utils.js'
import {UI} from './ui.js'

export class GameLoop extends Loop {
	build() {
		return [new Player(), new AI()]
	}

	mount() {
		this.loop.subscribe('stop', this.render)
		this.loop.subscribe('play', this.render)
		this.loop.subscribe('pause', this.render)
	}

	tick() {
		this.render()
	}

	render() {
		render(this.element, UI(this))
	}
}

export class Gold extends Task {
	delay = 1000
	duration = 0
	interval = 1000
	repeat = Infinity

	amount = 0
	maxAmount = 10

	tick() {
		this.increment()
	}

	increment() {
		if (this.amount === this.maxAmount) return
		this.amount = this.amount + 1
	}
}

export class Player extends Task {
	health = 3

	build() {
		return [
			new Gold(),
			new Minion(),
			new Minion(),
			new Minion(),
			new Minion(),
			new Board(),
		]
	}

	mount() {
		console.log('Player mount', this)
	}

	tick() {
		if (this.health <= 0) {
			console.log(`${this.constructor.name} lost`)
			this.root.pause()
		}
	}
}

export class AI extends Player {
	mount() {
		console.log('AI mount', this)
	}
}

const MINION_TYPES = ['rock', 'paper', 'scissors']

export class Minion extends Task {
	minionType = ''
	speed = 1
	y = 0

	delay = 1000
	duration = 0
	interval = 1000
	repeat = Infinity

	constructor() {
		super()
		this.minionType = random(MINION_TYPES)
	}

	deploy() {
		if (this.parent.is(AI)) this.y = this.parent.get(Board).height
		this.deployed = game.elapsedTime
		this.parent.get(Gold).amount--
		this.parent.get(Board).add(this)
	}

	// Returns the losing minion
	fight(opponent) {
		const winningCombos = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		}
		console.log(this.minionType, 'vs', opponent.minionType)
		if (winningCombos[this.minionType] === opponent.minionType) {
			console.log(opponent.minionType, 'lost')
			return opponent
		} else if (winningCombos[opponent.minionType] === this.minionType) {
			console.log(this.minionType, 'lost')
			return this
		} else {
			return null // it's a draw
		}
	}

	tick() {
		if (!this.parent?.is(Board)) return

		// while on board and not collision -> move
		if (this.parent.parent?.is(AI)) {
			const opponentMinion = this.root
				.find(Player)
				.get(Board)
				.getAll(Minion)
				.find((minion) => minion.y === this.y)
			if (opponentMinion) {
				const loser = this.fight(opponentMinion)
				loser.disconnect()
			}
			this.y = this.y - this.speed
			if (this.y === 0) {
				this.root.find(Player).health--
				this.disconnect()
			}
		} else {
			const opponentMinion = this.root
				.find(AI)
				.get(Board)
				.getAll(Minion)
				.find((minion) => minion.y === this.y)
			if (opponentMinion) {
				const loser = this.fight(opponentMinion)
				loser.disconnect()
			}
			this.y = this.y + this.speed
			if (this.y === this.parent.height) {
				this.root.find(AI).health--
				this.disconnect()
			}
		}
	}
}

export class Board extends Node {
	width = 1
	height = 4
}
