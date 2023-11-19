import PartySocket from 'partysocket'
import {socket, PARTYKIT_URL} from './multiplayer.js'
import {render, html, signal, effect} from './utils.js'
import {friendlyId} from './friendly-id.js'
import {RumbleGame} from './rumble-game.js'

/**
 * The lobby manages the "rooms" (or games) that are currently active.
 * You can create, join or leave a room. If you're the last to leave, the room will be removed.
 */
export class RumbleLobby extends HTMLElement {
	constructor() {
		super()

		this.rooms = signal([])
		this.gamesSocket = null

		effect(() => {
			this.render(this.rooms)
		})

		socket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			if (msg.type === 'connections') {
				this.rooms.value = msg.connections
			}
		})
	}

	createRoom() {
		this.leaveRoom()
		this.joinRoom(friendlyId())
	}

	joinRoom(id) {
		this.gamesSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'games',
			room: id,
		})
		this.gamesSocket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			console.log('games socket unhandled message', msg)
		})

		/** @type {RumbleGame} */
		const rumble = document.querySelector('rumble-game')

		// Once we're in the new room, we can start the game as well.
		rumble?.newGame()
		rumble?.game.start()
	}

	leaveRoom() {
		this.gamesSocket?.close()
		this.gamesSocket = null

		/** @type {RumbleGame} */
		const rumble = document.querySelector('rumble-game')
		rumble?.quitGame()
	}

	render(_) {
		const rooms = Object.entries(this.rooms.value).map(([id, count]) => ({id, count}))
		const totalConnections = Object.entries(this.rooms.value).reduce((acc, [id, count]) => acc + count, 0)
		const tpl = html`
			<article class="Splash">
				<h1>Triminion</h1>
				<p>
					<span>Gold is flowing,</span> <span>your minions await.</span>
					<span>Strategically deploy your</span>
					<strong>🪨📄✂️</strong>
					<span> and witness the battle.</span>
				</p>
			</article>

			<details open>
				<summary>
					Lobby (<live-presence></live-presence> online, ${rooms.length} games, ${totalConnections} playing)
				</summary>
				<ul>
					${this.renderRooms(rooms)}
				</ul>
			</details>

			<p>
				${this.gamesSocket
					? html`You are in: ${this.gamesSocket?.room}
							<button onclick=${() => this.leaveRoom()}>Leave</button> `
					: html`<button onclick=${() => this.createRoom()}>New Game</button>`}
			</p>
		`
		render(this, tpl)
	}

	renderRooms(rooms) {
		if (!rooms?.length) return html`<li>No active games</li>`
		return html` ${rooms.map(
			(room) => html`
				<li>
					${room.id} ${room.count && html`(${room.count})`}
					${room.id !== this.gamesSocket?.room
						? html` <button onclick=${() => this.joinRoom(room.id)}>Join</button> `
						: null}
				</li>
			`
		)}`
	}
}
