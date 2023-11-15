import {html, roundOne} from './utils.js'
import {Player, AI, Gold, Minion, Board} from './nodes.js'

export function UI(game) {
	if (!game.children?.length) return html`<nav>${Menu(game)}</nav>`

	const player = game.get(Player)
	const ai = game.get(AI)

	return html`
		<nav>${Menu(game)}</nav>
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

const deploy = (minion) => {
	console.log('deploy', minion, minion.parent)
	minion.deployed = game.elapsedTime
	minion.parent.get(Gold).amount--
	minion.parent.get(Board).add(minion)
}

const minion = (minion) => {
	return html`<li>
		<button onclick=${deploy}>${minion.minionType}</button>
		${minion.deployed ? roundOne(game.timeSince(minion.deployed) / 1000) : null}
	</li>`
}

function Menu() {
	const newGame = () => {
		game.start()
	}
	const stopGame = () => {
		console.log('stop')
		game.stop()
		
	}
	const toggle = () => {
		if (game.paused) {
			game.play()
		} else {
			game.pause()
		}
	}
	return html`
		<menu>
			${game.started
				? html`
						<button onclick=${toggle}>${game.paused ? 'Play' : 'Pause'}</button>
						<button onclick=${stopGame}>Stop</button>
				  `
				: html` <button onclick=${newGame}>New Game</button> `}
			<p>started? ${game.started}</p>
			<p>paused? ${game.paused}</p>
			<p>elapsedTime: ${game.elapsedTime}</p>
		</menu>
	`
}

function GoldBar(gold) {
	if (!gold.amount) return html`<p>&nbsp;</p>`
	const nuggets = Array(gold.amount).fill('🪙')
	return html`<p>${nuggets.map((n) => html`${n}`)}</p> `
}
