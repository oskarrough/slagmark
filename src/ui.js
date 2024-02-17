import {html} from 'uhtml/keyed'
import {roundOne} from './stdlib/utils.js'
import {StartCountdown} from './nodes.js'
import {Player, AIPlayer, Gold} from './nodes/player.js'
import {Fight} from './nodes/minion.js'

function startGameVersusAi(game) {
	game.runAction({type: 'spawnAI'})
	game.runAction({type: 'startGameCountdown', countFrom: 3})
}

export function UI(game) {
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
	const players = game.queryAll(Player)
	if (players.length < 1) return html`<p>Loading...</p>`
	if (players.length < 2)
		return html`<header>
			<slag-box split>
				<div>
					<h2>Invite your opponent</h2>
					<p>
						<label><input type="text" readonly value=${location.href} /><br>
<small>Share this URL &uarr;</small>
						</label>
					</p>
				</div>
				<p>OR &darr;</p>
				<div>
					<menu>
						<button onclick=${() => startGameVersusAi(game)} type="button">Play vs AI</button>
					</menu>
				</div>
			</slag-box>
		</header>`


	// decide who is "you" and who is the opponent
	const player1 = players.find((p) => p.number === 1)
	const player2 = players.find((p) => p.number === 2)
	const countdown = game.query(StartCountdown)
	const disabled = players.length < 2 || Boolean(countdown)

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
				${player.Minions.filter((m) => !m.deployed).length < 4 ? LoadingAvatar() : null}
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
	const isFighting = minion.queryAll(Fight)?.length > 0
	// const label = html`<span>${roundOne(minion.y)}/${roundOne(topPercentage)}%</span>`
	return html`<li
		class="Minion"
		?fighting=${isFighting}
		style=${`top: ${topPercentage}%`}
		data-player-number=${minion.Player.number}
	>
		${minionTypeToEmoji(minion.minionType)}
	</li>`
}

function MinionAvatar(minion) {
	const canDeploy = !minion.deployed && minion.Player.query(Gold)?.amount >= minion.cost

	const deploy = () => {
		minion.Game.runAction({type: 'deployMinion', minionId: minion.id})
	}

	return html`<li class="Minion" data-player-number=${minion.Player.number}>
		<button type="button" ?disabled=${!canDeploy} onclick=${deploy}>
			${minionTypeToEmoji(minion.minionType)}
		</button>
		<span>${minion.cost}</span>
	</li>`
}

function LoadingAvatar() {
	return html`<li class="Minion Minion--loading">
		<button type="button" disabled></button>
		<span>?</span>
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
