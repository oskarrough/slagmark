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

	decrement() {
		if (this.amount < 2) return 0
		this.amount = this.amount - 1
	}
}

export class RefillMinions extends Task {
	duration = 0
	interval = 3000

	tick() {
		if (this.parent.getAll(Minion).length < 4) {
			this.parent.add(new Minion())
		}
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
			new RefillMinions(),
		]
	}

	tick() {
		if (this.health <= 0) {
			console.log(`${this.constructor.name} lost`)
			this.root.pause()
		}
	}
}

export class AI extends Player {}

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
		this.parent.get(Gold).decrement()
		this.parent.get(Board).add(this)
	}

	// Returns the losing minion, if draw return a random winner
	fight(opponent) {
		const winningCombos = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		}
		console.log('fight', this.minionType, 'vs', opponent.minionType)
		if (winningCombos[this.minionType] === opponent.minionType) {
			return opponent
		} else if (winningCombos[opponent.minionType] === this.minionType) {
			return this
		} else {
			return random([this, opponent])
		}
	}

	tick() {
		if (!this.deployed) return

		const isAIMinion = this.parent.parent.is(AI)
		const opponent = isAIMinion ? Player : AI

		const enemy = this.findEnemy(opponent)
		if (enemy) {
			const loser = this.fight(enemy)
			loser?.disconnect()
		}

		if (!this.parent) return

		this.move(isAIMinion ? -1 : 1)

		if (this.y === (isAIMinion ? -1 : this.parent.height)) {
			this.root.find(opponent).health--
			this.disconnect()
		}
	}

	move(direction = 1) {
		this.y = this.y + this.speed * direction
	}

	findEnemy(player) {
		return this.root
			.find(player)
			.get(Board)
			.getAll(Minion)
			.find((minion) => minion.y === this.y)
	}
}

export class Board extends Node {
	width = 1
	height = 10
}
