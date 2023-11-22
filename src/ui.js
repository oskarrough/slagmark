import {html, roundOne} from './utils.js'
import {Player, Minion, Gold, Board} from './nodes.js'

export function UI(game) {
	if (!game?.children?.length) return html``

	const players = game.queryAll(Player)
	const player1 = players[0]
	const player2 = players[1]

	return html`
		<header>
			<nav>${Menu(game)}</nav>
		</header>

		<aside>
			<div>
				<h2>AI ${HealthBar(player2.health)}</h2>
				<ul class="MinionBar">
					${MinionList(player2, false)}
				</ul>
				${GoldBar(player2.Gold)}
			</div>
			<div>
				<h2>Player ${HealthBar(player1.health)}</h2>
				<ul class="MinionBar">
					${MinionList(player1, false)}
				</ul>
				${GoldBar(player1.Gold)}
			</div>
		</aside>

		<main>
			<ul data-ai>
				${MinionList(player2, true)}
			</ul>
			<ul data-player>
				${MinionList(player1, true)}
			</ul>
		</main>
	`
}

function Menu(game) {
	const fps = roundOne(1000 / game.deltaTime)
	const toggle = () => (game.paused ? game.play() : game.pause())
	const quit = () => {
		game.stop()
		location.reload()
	}
	return html`
		<menu>
			<button type="button" onclick=${toggle}>${game.paused ? 'Play' : 'Pause'}</button>
			<button hidden type="button" onclick=${quit}>Quit</button>
			<p style="min-width: 5rem"><small>FPS ${fps}</small></p>
			<p style="min-width: 3.5rem"><small>${roundOne(game.elapsedTime / 1000)}s</small></p>
		</menu>
	`
}

/* Returns a list of HTML minions */
function MinionList(parent, deployed) {
	let list = parent.queryAll(Minion)
	if (!list?.length) return null
	if (deployed) {
		list = list.filter((m) => m.deployed)
	} else if (deployed === false) {
		list = list.filter((m) => !m.deployed)
	}
	if (!list.length) return null
	return html`${list.map((m) => minion(m))}`
}

function minionTypeToEmoji(type) {
	const map = {
		rock: '🪨',
		paper: '📄',
		scissors: '✂️',
	}
	return map[type] || type
}

function minion(minion) {
	const canDeploy = !minion.deployed && minion.parent.query(Gold).amount >= minion.cost
	const height = minion.parent.parent.query(Board).height
	const topPercentage = ((height - minion.y) / height) * 100
	return html`<li
		class=${`Minion ${minion.parent.ai ? 'ai' : null}`}
		data-y=${minion.y}
		style=${`top: ${topPercentage}%`}
	>
		<button type="button" ?disabled=${!canDeploy} onclick=${() => minion.deploy()}>
			${minionTypeToEmoji(minion.minionType)}
		</button>
		<span>${minion.deployed ? minion.y : minion.cost}</span>
	</li>`
}

function GoldBar(gold) {
	if (!gold?.amount) return html`<ul class="GoldBar"></ul>`
	const nuggets = Array(gold.amount).fill('🪙')
	return html`<ul class="GoldBar">
		${nuggets.map((n) => html`<li>${n}</li>`)}
	</ul>`
}

function HealthBar(health) {
	if (!health) return html`<ul class="HealthBar"></ul>`
	const hearts = Array(health).fill('♥️')
	return html`<ul class="HealthBar">
		${hearts.map((n) => html`<li>${n}</li>`)}
	</ul>`
}

