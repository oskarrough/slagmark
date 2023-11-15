import {Node, Loop, Task} from 'vroum/core'
import {render, random} from './utils.js'
import {UI} from './ui.js'

export class GameLoop extends Loop {
	build() {
		return [new Player(), new AI(), new Board()]
	}

	mount() {
		render(this.element, UI(this))
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
}

export class Player extends Node {
	build() {
		return [
			new Gold(),
			new Board(),
			new Minion(),
			new Minion(),
			new Minion(),
			new Minion(),
		]
	}

	mount() {
		console.log('Player mount', this)
	}
}

export class AI extends Node {
	build() {
		return [
			new Gold(),
			new Board(),
			new Minion(),
			new Minion(),
			new Minion(),
			new Minion(),
		]
	}

	mount() {
		console.log('AI mount', this)
	}
}

export class Minion extends Node {
	minionType = ''

	init() {
		this.minionType = random(['rock', 'paper', 'scissor'])
	}
}

export class Board extends Node {
	width = 5
	height = 10
}
