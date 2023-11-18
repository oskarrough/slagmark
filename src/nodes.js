import {Node, Loop, Task} from 'vroum'
import {render, random} from './utils.js'
import {UI} from './ui.js'

export class GameLoop extends Loop {
	constructor(props) {
		super()
		// The DOM element to render to
		this.element = props.element
		console.log(this.element)
	}

	static get descendants() {
		return {
			// Participants: {type: Participant, list: true},
			Player: {type: Player},
			AI: {type: AI},
			Board: {type: Board},
			Renderer: {type: Renderer},
		}
	}

	mount() {
		this.subscribe('start', this.Renderer.render)
		this.subscribe('stop', this.Renderer.render)
		this.subscribe('play', this.Renderer.render)
		this.subscribe('pause', this.Renderer.render)
	}

	build() {
		return [new Player(), new AI(), new Board(), new Renderer()]
	}
}

class Renderer extends Task {
	static get ancestors() {
		return {Loop: {type: GameLoop}}
	}

	delay = 0
	duration = 0
	interval = 1000
	repeat = Infinity

	tick() {
		console.log('render tick')
		this.render()
	}

	render() {
		if (!this.Loop.element) throw new Error('missing DOM element to render to')
		render(this.Loop.element, UI(this.Loop))
	}
}

class Participant extends Task {
	health = 3

	static get ancestors() {
		return {
			Loop: {type: GameLoop},
		}
	}

	static get descendants() {
		return {
			Gold: {type: Gold},
			Minions: {type: Minion, list: true},
			RefillMinions: {type: RefillMinions},
		}
	}

	build() {
		return [new Gold(), new Minion(), new Minion(), new Minion(), new Minion(), new RefillMinions()]
	}

	afterTick() {
		if (this.health <= 0) {
			console.log(`${this.constructor.name} lost`)
			this.disconnect()
			this.Loop.stop()
		}
	}
}

export class Player extends Participant {}
export class AI extends Participant {}

export class Gold extends Task {
	static get ancestors() {
		return {
			Owner: {type: Participant},
		}
	}

	delay = 0
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

	static get ancestors() {
		return {
			Owner: {type: Participant},
		}
	}

	tick() {
		if (this.Owner.Minions?.length < 4) {
			this.Owner.add(new Minion())
		}
	}
}

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

	static get ancestors() {
		return {
			Loop: {type: GameLoop},
			Owner: {type: Participant},
		}
	}

	constructor() {
		super()
		this.minionType = random(MINION_TYPES)
	}

	tick() {
		if (!this.deployed) return
	}

	afterTick() {
		if (!this.deployed) return

		const isAI = this.Owner.is(AI)
		const startY = isAI ? this.Loop.Board.height : 0
		const finalY = isAI ? 0 : this.Loop.Board.height
		const opponent = isAI ? this.Loop.Player : this.Loop.AI

		// Fight any enemies on same Y, and remove the loser.
		if (this.y !== startY && this.y !== finalY) {
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
		if (this.Owner.Gold.amount < this.cost) {
			console.log('not enough gold')
			return
		}
		this.Owner.Gold.decrement(this.cost)
		// Deploy
		const isAI = this.parent.is(AI)
		this.y = isAI ? this.Loop.Board.height : 0
		this.deployed = this.Loop.elapsedTime
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
		return opponent.Minions.filter((minion) => minion.y === this.y)
	}
}

export class Board extends Node {
	width = 1
	height = 8
}
