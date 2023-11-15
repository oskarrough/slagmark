import {html, roundOne} from './utils.js'
import {Player, AI, Gold, Minion, Board} from './nodes.js'

export function UI(game) {
	if (!game.children?.length) return html`<nav>${Menu(game)}</nav>`

	const player = game.get(Player)
	const ai = game.get(AI)

	return html`
		<nav>${Menu(game)}</nav>
		<aside>
			<h2>AI ${ai.health} ♥️</h2>
			${GoldBar(ai.get(Gold))}
			<ul>
				${ai.getAll(Minion).map(minion)}
			</ul>
			<ul>
				${player.getAll(Minion).map(minion)}
			</ul>
			${GoldBar(player.get(Gold))}
			<h2>Player ${player.health} ♥️</h2>
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

const minion = (minion) => {
	return html`<li>
		<button onclick=${() => minion.deploy()}>${minion.minionType}</button>
		${minion.parent?.is(Board) ? minion.y : null}
		<time hidden
			>${minion.deployed
				? roundOne(game.timeSince(minion.deployed) / 1000)
				: null}</time
		>
	</li>`
}

function Menu(game) {
	const newGame = () => game.start()
	const stopGame = () => game.stop()
	const toggle = () => (game.paused ? game.play() : game.pause())
	return html`
		<menu>
			${game.started
				? html`
						<button onclick=${toggle}>${game.paused ? 'Play' : 'Pause'}</button>
						<button onclick=${stopGame}>Quit</button>
						<p>elapsedTime: ${roundOne(game.elapsedTime)}</p>
				  `
				: html` <button onclick=${newGame}>New Rumble</button> `}
		</menu>
	`
}

function GoldBar(gold) {
	if (gold.amount < 1) return html`<p>&nbsp;</p>`
	const nuggets = Array(gold.amount).fill('🪙')
	return html`<p class="GoldBar">${nuggets.map((n) => html`${n}`)}</p> `
}
