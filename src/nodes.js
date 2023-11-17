import {Node, Loop, Task} from 'vroum'
import {render, random} from './utils.js'
import {UI} from './ui.js'

export class GameLoop extends Loop {
	build() {
		return [new Player(), new AI(), new Board()]
	}

	mount() {
		this.loop.subscribe('stop', this.render)
		this.loop.subscribe('play', this.render)
		this.loop.subscribe('pause', this.render)
	}

	tick() {
		if (!this.element) throw new Error('missing DOM element to render to')
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

	increment(value = 1) {
		if (this.amount === this.maxAmount) return
		this.amount = this.amount + value
	}

	decrement(value = 1) {
		if (this.amount < 2) return 0
		this.amount = this.amount - value 
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
		return [new Gold(), new Minion(), new Minion(), new Minion(), new Minion(), new RefillMinions()]
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
	cost = 2

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

		const isAI = this.parent.is(AI)
		const startY = isAI ? this.root.get(Board).height : 0
		const finalY = isAI ? 0 : this.root.get(Board).height
		const opponent = this.root.find(isAI ? Player : AI)

		// Fight any enemies on same Y, and remove the loser.
		if (this.y !== startY && this.y !== finalY)  {
			const enemies = this.findEnemies(opponent)
			for (const enemy of enemies) {
				const loser = this.fight(enemy)
				loser.disconnect()
				if (loser === this) return
			}
		}

		// If we reached the opposite end, opponent player loses a life, and we leave the board.
		if (this.y === finalY) {
			opponent.health--
			this.disconnect()
			return
		}

		this.move(isAI ? -1 : 1)
	}

	deploy() {
		// Handle gold
		if (this.parent.get(Gold).amount < this.cost) {
			console.log('not enough gold')
			return
		}
		this.parent.get(Gold).decrement(this.cost)
		// Deploy
		const isAI = this.parent.is(AI)
		this.y = isAI ? this.root.get(Board).height : 0
		this.deployed = this.root.elapsedTime
		console.log(isAI ? 'AI' : 'Player', 'deploy', this.minionType, this.y)
	}

	move(direction = 1) {
		this.y = Math.max(0, this.y + this.speed * direction)
	}

	// Returns the losing minion, if draw return a random winner
	fight(opponent) {
		const isAI = this.parent.is(AI)
		console.log('Fight on', this.y, isAI ? 'AI' : 'Player', this.minionType, 'vs', opponent.minionType)
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

	findEnemies(opponent) {
		return opponent.getAll(Minion).filter((minion) => minion.y === this.y)
	}
}

export class Board extends Node {
	width = 1
	height = 8
}
