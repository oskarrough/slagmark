import {roundOne} from './utils.js'
import {html} from 'uhtml'
import {Countdown, Player, Gold} from './nodes.js'

export function UI(game) {
	if (!game?.children?.length) return html`<p>Waiting for game...</p>`

	const players = game.queryAll(Player)
	const player1 = players[0]
	const player2 = players[1]
	const countdown = game.query(Countdown)
	const disabled = players.length < 2 || Boolean(countdown)

	if (players.length < 2) {
		return html` <header>
			<p class="Countdown">
				<span>
					Waiting for players... ${players.length}/2<br />
					<label>Share this URL to join: <input readonly value=${location.href} /></label>
				</span>
			</p>
		</header>`
	}

	return html`
		<header>
			<nav>${Menu(game)}</nav>
			${countdown ? html`<p class="Countdown"><span>${countdown.count}</span></p>` : ''}
		</header>

		<aside ?disabled=${disabled}>
			<div>
				<h2>Player ${player2.number} ${HealthBar(player2.health)}</h2>
				<ul class="MinionBar">
					${MinionList(player2, false)}
				</ul>
				${GoldBar(player2.Gold)}
			</div>
			<div>
				<h2>Player ${player1.number} ${HealthBar(player1.health)}</h2>
				<ul class="MinionBar">
					${MinionList(player1, false)}
				</ul>
				${GoldBar(player1.Gold)}
			</div>
		</aside>

		<main>
			<ul data-player2>
				${MinionList(player2, true)}
			</ul>
			<ul data-player1>
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
		history.replaceState({}, '', '/')
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
function MinionList(player, deployed) {
	let list = player.Minions
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
	const canDeploy = !minion.deployed && minion.Player.query(Gold)?.amount >= minion.cost
	const height = minion.Game.Board.height
	const topPercentage = ((height - minion.y) / height) * 100

	const onClick = () => {
		console.log('minion onclick')
		minion.Game.runAction({type: 'deployMinion', id: minion.id})
	}

	return html`<li
		class="Minion"
		data-player-number=${minion.Player.number}
		data-y=${minion.y}
		style=${`top: ${topPercentage}%`}
	>
		<button type="button" ?disabled=${!canDeploy} onclick=${onClick}>
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
