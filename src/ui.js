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
				<h2>AI ${HealthBar(ai.health)}</h2>
				<ul class="MinionBar">
					${ai.getAll(Minion).map(minion)}
				</ul>
				${GoldBar(ai.get(Gold))}
			</div>
			<div>
				<h2>Player ${HealthBar(player.health)}</h2>
				<ul class="MinionBar">
					${player.getAll(Minion).map(minion)}
				</ul>
				${GoldBar(player.get(Gold))}
			</div>
		</aside>
		<main>
			<div class="Board">
				<ul data-ai>
					${ai.get(Board).getAll(Minion).map(minion)}
				</ul>
				<ul data-player>
					${player.get(Board).getAll(Minion).map(minion)}
				</ul>
			</div>
		</main>
	`
}

function Menu(game) {
	const newGame = () => game.start()
	const stopGame = () => game.stop()
	const toggle = () => (game.paused ? game.play() : game.pause())
	const fps = roundOne(1000 / game.deltaTime)
	return html`
		<menu>
			${game.started
				? html`
						<button onclick=${toggle}>${game.paused ? 'Play' : 'Pause'}</button>
						<button onclick=${stopGame}>Quit</button>
				  `
				: html` <button onclick=${newGame}>New Rumble</button> `}
						<p style="min-width: 6rem">FPS ${fps}</p>
						<p style="min-width: 2rem">${roundOne(game.elapsedTime / 1000)}</p>
		</menu>
	`
}

function minionTypeToEmoji(type) {
	const map = {
		rock: '🪨',
		paper: '📄',
		scissors: '✂️',
	}
	return map[type] || type
}

const minion = (minion) => {
	const isAi = minion.parent?.is(AI) || minion.parent.parent.is(AI)
	const height = minion.parent.height
	return html`<li
		class=${`Minion ${isAi ? 'ai' : null}`}
		data-y=${minion.y}
		style=${`top: ${((height - minion.y) / height) * 100}%`}
	>
		<button onclick=${() => minion.deploy()}>${minionTypeToEmoji(minion.minionType)}</button>
		<span>${minion.deployed ? minion.y : minion.cost}</span>
	</li>`
}

function GoldBar({amount}) {
	if (!amount) amount = 0
	const nuggets = Array(amount).fill('🪙')
	return html`<ul class="GoldBar">
		${nuggets.map((n) => html`<li>${n}</li>`)}
	</ul>`
}

function HealthBar(health) {
	if (!health) health = 0
	const hearts = Array(health).fill('♥️')
	return html`<ul class="HealthBar">
		${hearts.map((n) => html`<li>${n}</li>`)}
	</ul>`
}
