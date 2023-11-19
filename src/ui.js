import {html, roundOne} from './utils.js'
import {AI} from './nodes.js'

export function UI(game) {
	if (!game?.children?.length) return html``
	const player = game.Player
	const ai = game.AI

	return html`
		<header>
			<nav>${Menu(game)}</nav>
		</header>

		<aside>
			<div>
				<h2>AI ${HealthBar(ai.health)}</h2>
				<ul class="MinionBar">
					${MinionList(ai, false)}
				</ul>
				${GoldBar(ai.Gold)}
			</div>
			<div>
				<h2>Player ${HealthBar(player.health)}</h2>
				<ul class="MinionBar">
					${MinionList(player, false)}
				</ul>
				${GoldBar(player.Gold)}
			</div>
		</aside>

		<main>
			<ul data-ai>
				${MinionList(ai, true)}
			</ul>
			<ul data-player>
				${MinionList(player, true)}
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
			<button type="button" onclick=${quit}>Quit</button>
			<p><live-presence></live-presence> online&nbsp;&nbsp;</p>
			<p style="min-width: 5rem"><small>FPS ${fps}</small></p>
			<p style="min-width: 3.5rem"><small>${roundOne(game.elapsedTime / 1000)}s</small></p>
		</menu>
	`
}

/* Returns a list of HTML minions */
function MinionList(parent, deployed) {
	let list = parent.Minions
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

const minion = (minion) => {
	const isAi = minion.parent.is(AI)
	const canDeploy = !minion.deployed && minion.Owner.Gold.amount >= minion.cost
	const height = minion.Loop.Board.height
	const topPercentage = ((height - minion.y) / height) * 100
	return html`<li
		class=${`Minion ${isAi ? 'ai' : null}`}
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

function Splash(game) {
	// const btn = html`<button type="button" onclick=${() => game.start()}>New Rumble</button>`
	return html`
		<article class="Splash">
			<p>
				Gold is flowing, your minions await.<br />
				Strategically deploy your ${minionTypeToEmoji('rock')} ${minionTypeToEmoji('paper')}
				${minionTypeToEmoji('scissors')} and witness the battle.
			</p>
			<br />
			<p><live-presence></live-presence> lurkers online.</p>
		</article>
	`
}
