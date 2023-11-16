import {html, roundOne} from './utils.js'
import {Player, AI, Gold, Minion, Board} from './nodes.js'

export function UI(game) {
	if (!game.children?.length) return html`<nav>${Menu(game)}</nav>`

	const player = game.get(Player)
	const ai = game.get(AI)

	return html`
		<nav>${Menu(game)}</nav>
		<aside>
			<div>
				<h2>AI ${ai.health} ♥️</h2>
				<ul>
					${ai.getAll(Minion).map(minion)}
				</ul>
				${GoldBar(ai.get(Gold))}
			</div>
			<div>
				<h2>Player ${player.health} ♥️</h2>
				<ul>
					${player.getAll(Minion).map(minion)}
				</ul>
				${GoldBar(player.get(Gold))}
			</div>
		</aside>
		<main>
			<div class="Board">
				<ul>
					${ai.get(Board).getAll(Minion).map(minion)}
				</ul>
				<ul>
					${player.get(Board).getAll(Minion).map(minion)}
				</ul>
			</div>
		</main>
	`
}

function minionTypeToEmoji(type) {
	if (type === 'rock') return '🪨'
	if (type === 'paper') return '📄'
	if (type === 'scissors') return '✂️'
	return type
}

const minion = (minion) => {
	const isAi = minion.parent?.is(AI) || minion.parent.parent.is(AI)
	const height = minion.parent.height
	return html`<li
		class=${`Minion ${isAi ? 'ai' : null}`}
		style=${`top: ${((height - minion.y) / height) * 100}%`}
	>
		<button onclick=${() => minion.deploy()}>
			${minionTypeToEmoji(minion.minionType)}
		</button>
		${minion.deployed ? minion.y : null}
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
						<p>${roundOne(game.elapsedTime / 1000)}</p>
				  `
				: html` <button onclick=${newGame}>New Rumble</button> `}
		</menu>
	`
}

function GoldBar(gold) {
	const nuggets = Array(gold.amount).fill('🪙')
	return html`<ul class="GoldBar">
		${nuggets.map((n) => html`<li>${n}</li>`)}
	</ul>`
}
