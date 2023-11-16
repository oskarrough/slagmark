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
			// console.log(`${this.constructor.name} lost`)
			// this.root.stop()
		}
	}
}

export class AI extends Player {}

const MINION_TYPES = ['rock', 'paper', 'scissors']

export class Minion extends Task {
	minionType = ''
	speed = 1
	y = 0
	cost = 1

	delay = 1000
	duration = 0
	interval = 1000
	repeat = Infinity

	constructor() {
		super()
		this.minionType = random(MINION_TYPES)
	}

	tick() {
		if (!this.deployed) return

		const isAIMinion = this.parent.parent.is(AI)
		const opponent = isAIMinion ? Player : AI

		// Fight any enemies on same Y, and remove the loser.
		const enemies = this.findEnemies(opponent)
		for (const enemy of enemies) {
			const loser = this.fight(enemy)
			loser.disconnect()
			if (loser === this) return
		}

		// If we reached the opposite end, opponent player loses a life, and we leave the board.
		const finalY = isAIMinion ? 0 : this.parent.height
		if (this.y === finalY) {
			this.root.find(opponent).health--
			this.disconnect()
			return
		}

		this.move(isAIMinion ? -1 : 1)
	}

	deploy() {
		const isAI = this.parent.is(AI)
		if (isAI) this.y = this.parent.get(Board).height
		if (this.parent.get(Gold).amount < this.cost) {
			console.log('not enough gold')
			return
		}
		this.parent.get(Gold).decrement()
		this.deployed = this.root.elapsedTime
		this.parent.get(Board).add(this)
		console.log(isAI ? 'AI' : 'Player', 'deploy', this.minionType)
	}

	move(direction = 1) {
		this.y = Math.max(0, this.y + this.speed * direction)
	}

	// Returns the losing minion, if draw return a random winner
	fight(opponent) {
		const isAI = this.parent.parent.is(AI)
		console.log(isAI ? 'AI' : 'Player', this.minionType, 'vs', opponent.minionType)
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

	// Returns a list of enemy minions on the same Y position.
	findEnemies(player) {
		return this.root
			.find(player)
			.get(Board)
			.getAll(Minion)
			.filter((minion) => minion.y === this.y)
	}
}

export class Board extends Node {
	width = 1
	height = 8
}
