import { Node, Loop, Task } from 'vroum/core'
import { render, html, random, roundOne } from './utils.js'

function Menu() {
	const newGame = () => {
		game.start()
	}
	return html`
		<menu>
			<button onclick=${newGame}>New Game</button>
		</menu>
	`
}

function GoldBar(gold) {
	if (!gold.amount) return html`<p>&nbsp;</p>`
	const nuggets = Array(gold.amount).fill('🪙')
	return html`<p>${nuggets.map(n => html`${n}`)}</p>
		`
}

export default function UI(game) {
	const player = game.get(Player)
	const ai = game.get(AI)
	// const board = game.get(Board)

	const deploy = (minion) => {
		console.log('deploy', minion, minion.parent)
		minion.deployed = game.time
		minion.parent.get(Gold).amount--
		minion.parent.get(Board).add(minion)
	}

	const minion = (minion) =>
		html`<li>
			<button onclick=${() => deploy(minion)}>${minion.minionType}</button>
			${minion.deployed ? roundOne(game.timeSince(minion.deployed) / 1000) : null}
		</li>`

	return html`
		<aside>
			<h2>AI</h2>
			${GoldBar(ai.get(Gold))}
			<ul>
				${ai.getAll(Minion).map(minion)}
			</ul>
			<ul>
				${player.getAll(Minion).map(minion)}
			</ul>
			${GoldBar(player.get(Gold))}
			<h2>Player</h2>
		</aside>
		<main>
			<ul>
				${ai.get(Board).getAll(Minion).map(minion)}
			</ul>
			<ul>
				${player.get(Board).getAll(Minion).map(minion)}
			</ul>
		</main>
	`
}

export class App extends Loop {
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

class Gold extends Task {
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

class Player extends Node {
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
		console.log('Player', this)
	}
}

class AI extends Node {
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
		console.log('AI', this)
	}
}

class Minion extends Node {
	minionType = ''

	init() {
		this.minionType = random(['rock', 'paper', 'scissor'])
		console.log('Minion', this.minionType)
	}
}

// class Match extends Node {
//   build() {
//     return [new Board()]
//   }
// }

class Board extends Node {
	width = 5
	height = 10
}
