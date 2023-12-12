import {html} from 'uhtml/keyed'
import {roundOne} from './stdlib/utils.js'
import {GameCountdown, Player, Gold, AIPlayer} from './nodes.js'

function addAi(game) {
	game.runAction({type: 'spawnAI'})
}

export function UI(game) {
	const players = game.queryAll(Player)

	if (players.length < 1) return html`<p>Loading...</p>`

	// decide who is "you" and who is the opponent
	const player1 = players.find((p) => p.number === 1)
	const player2 = players.find((p) => p.number === 2)

	const countdown = game.query(GameCountdown)
	const disabled = players.length < 2 || Boolean(countdown)

	if (game.gameOver)
		return html`
			<article>
				<h1>Gameover †</h1>
				<p>Player ${game.loser.number} lost</p>
				<p>Elapsed time: ${roundOne(game.elapsedTime / 1000)}s</p>
				<br />
				<p>😊</p>
			</article>
		`
	if (players.length < 2)
		return html`<slag-box>
			<p>
				Need one more player.<br /><br />
				<label
					>Share this URL with someone to join: <input type="text" readonly value=${location.href}
				/></label>
			</p>
			<br />
			<p>
				Or.. <button onclick=${() => addAi(game)} type="button">Play against a computer bot</button> instead.
			</p>
		</slag-box>`

	return html`
		<header>
			<menu horizontal>${Menu(game)}</menu>
			${players.length < 2 ? html` <p class="Countdown"><span> </span></p>` : ''}
			${countdown?.count > 0 ? html`<p class="Countdown"><span>${countdown.count}</span></p>` : ''}
		</header>

		<aside ?disabled=${disabled}>${PlayerDisplay(player2, game)} ${PlayerDisplay(player1, game)}</aside>

		<main>
			<ul data-player2>
				${MinionList(player2)}
			</ul>
			<ul data-player1>
				${MinionList(player1)}
			</ul>
		</main>
	`
}

function Menu(game) {
	const fps = roundOne(1000 / game.deltaTime)
	const toggle = () => (game.paused ? game.play() : game.pause())
	return html`
		<button type="button" onclick=${toggle}>${game.paused ? 'Play' : 'Pause'}</button>
		<p style="min-width: 5rem"><small>FPS ${fps}</small></p>
		<p style="min-width: 3.5rem"><small>${roundOne(game.elapsedTime / 1000)}s</small></p>
	`
}

function PlayerDisplay(player, game) {
	if (!player) return html``
	const isOpponent = player.id !== game.playerId
	if (isOpponent) {
		const ai = player instanceof AIPlayer
		return html`<slag-player disabled>
			<h2>${ai ? 'AI' : 'Player'} ${player.number} ${HealthBar(player.health)}</h2>
		</slag-player>`
	}
	return html`
		<slag-player>
			<h2>Player ${player.number} ${HealthBar(player.health)}</h2>
			<ul class="MinionBar">
				${player.Minions.filter((m) => !m.deployed).map((m) => MinionAvatar(m))}
			</ul>
			${GoldBar(player.Gold)}
		</slag-player>
	`
}

function MinionList(player) {
	const list = player?.Minions.filter((m) => m.deployed)
	if (!list?.length) return null
	return html`${list.map((m) => DeployedMinion(m))}`
}

function DeployedMinion(minion) {
	const height = minion.Game.Board.height
	const topPercentage = minion.deployed ? ((height - minion.y) / height) * 100 : 0

	return html`<li
		class="Minion"
		data-player-number=${minion.Player.number}
		data-y=${minion.y}
		style=${`top: ${topPercentage}%`}
	>
		${minionTypeToEmoji(minion.minionType)}
		<span>${minion.y}</span>
	</li>`
}

function MinionAvatar(minion) {
	const canDeploy = !minion.deployed && minion.Player.query(Gold)?.amount >= minion.cost

	const deploy = () => {
		minion.Game.runAction({type: 'deployMinion', id: minion.id})
	}

	return html`<li class="Minion Minion--avatar" data-player-number=${minion.Player.number}>
		<button type="button" ?disabled=${!canDeploy} onclick=${deploy}>
			${minionTypeToEmoji(minion.minionType)}
		</button>
		<span>${minion.cost}</span>
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
	if (!Number.isFinite(health) || health < 1) return html`<ul class="HealthBar"></ul>`
	const hearts = Array(health).fill('♥️')
	return html`<ul class="HealthBar">
		${hearts.map((n) => html`<li>${n}</li>`)}
	</ul>`
}

/**
 * Turns a minion type into an emoji
 * @param {string} type
 * @returns {string} emoji
 */
function minionTypeToEmoji(type) {
	const map = {
		rock: '🪨',
		paper: '📄',
		scissors: '✂️',
	}
	return map[type] || type
}
