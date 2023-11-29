import {roundOne} from './utils.js'
import {html} from 'uhtml'
import {GameCountdown, Player, Gold} from './nodes.js'

export function UI(game) {
	if (!game?.children?.length) return html`<p>Waiting for game...</p>`

	const players = game.queryAll(Player)
	const player1 = players[0]
	const player2 = players[1]
	const countdown = game.query(GameCountdown)
	const disabled = players.length < 2 || Boolean(countdown)

	return html`
		<header>
			<nav>${Menu(game)}</nav>

			${players.length < 2 &&
			html` <p class="Countdown">
				<span>
					Waiting for players... ${players.length}/2<br />
					<label>Share this URL to join: <input readonly value=${location.href} /></label>
				</span>
			</p>`}
			${countdown?.count > 0 ? html`<p class="Countdown"><span>${countdown.count}</span></p>` : ''}
		</header>

		<aside ?disabled=${disabled}>${PlayerDisplay(player2)} ${PlayerDisplay(player1)}</aside>

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

function PlayerDisplay(player) {
	if (!player) return html`Waiting for player...`
	return html`
		<div>
			<h2>Player ${player.number} ${HealthBar(player.health)}</h2>
			<ul class="MinionBar">
				${MinionList(player, false)}
			</ul>
			${GoldBar(player.Gold)}
		</div>
	`
}

/* Returns a list of HTML minions */
function MinionList(player, deployed) {
	let list = player?.Minions
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
