import {html, roundOne} from './utils.js'
import {Player, AI, Gold, Minion, Board} from './nodes.js'

export function UI(game) {
	if (!game.children?.length)
		return html`
			<header>
				<article class="Splash">
					Gold is flowing, your minions await.<br />
					Strategically deploy your ${minionTypeToEmoji('rock')} ${minionTypeToEmoji('paper')}
					${minionTypeToEmoji('scissors')} and witness the battle.
					<br />
					<br />
					<button type="button" onclick=${() => game.start()}>New Rumble</button>
					<br /><br />
					<p><live-presence></live-presence> players in the lobby</p>
					<br /><br /><br />
					<p style="opacity:0.6">
						<small>
							Pssst: this is an experiment from <em>Ooh Games</em> in creating small games for the web.
							<a href="https://matrix.to/#/#ooh-games:matrix.org">Come say hi</a>, help make it fun!
						</small>
					</p>
				</article>
			</header>
		`

	const player = game.get(Player)
	const ai = game.get(AI)

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
				${GoldBar(ai.get(Gold))}
			</div>
			<div>
				<h2>Player ${HealthBar(player.health)}</h2>
				<ul class="MinionBar">
					${MinionList(player, false)}
				</ul>
				${GoldBar(player.get(Gold))}
			</div>
		</aside>

		<main>
			<div class="Board">
				<ul data-ai>
					${MinionList(ai, true)}
				</ul>
				<ul data-player>
					${MinionList(player, true)}
				</ul>
			</div>
		</main>
	`
}

function MinionList(parent, deployed) {
	const list = parent.getAll(Minion).filter((m) => Boolean(m.deployed) === deployed)
	if (!list.length) return html``
	return list.map((m) => minion(m))
}

function Menu(game) {
	// const newGame = () => game.start()
	const stopGame = () => game.stop()
	const toggle = () => (game.paused ? game.play() : game.pause())
	const fps = roundOne(1000 / game.deltaTime)
	return html`
		<menu>
			<button type="button" onclick=${toggle}>${game.paused ? 'Play' : 'Pause'}</button>
			<button type="button" onclick=${stopGame}>Quit</button>
			<p><live-presence></live-presence> online&nbsp;&nbsp;</p>
			<p style="min-width: 5rem"><small>FPS ${fps}</small></p>
			<p style="min-width: 3.5rem"><small>${roundOne(game.elapsedTime / 1000)}s</small></p>
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
	const isAi = minion.parent.is(AI)
	const height = minion.parent.parent.get(Board).height
	const canDeploy = minion.parent.get(Gold).amount >= minion.cost
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
	if (!gold.amount) return html`<ul class="GoldBar"></ul>`
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
