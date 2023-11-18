import {render, html} from './utils.js'
import {friendlyId} from './friendly-id.js'
import {effect, signal} from 'usignal'
import PartySocket from 'partysocket'
import {PARTYKIT_URL} from './multiplayer.js'

/** A custom element wrapper around the UI */
export class RumbleLobby extends HTMLElement {
	constructor() {
		super()
		this.whateverSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'whatever',
			room: 'active-connections',
		})
		this.whateverSocket.addEventListener('message', (event) => {
			const connections = JSON.parse(event.data)
			this.rooms.value = connections
			this.render()
		})

		this.rooms = signal([])
		effect(() => {
			this.render()
		})

		window.rumblelobby = this
	}

	createRoom() {
		this.leaveRoom()
		this.joinRoom(friendlyId())
	}

	async joinRoom(id) {
		await this.gamesSocket?.close()
		this.gamesSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'games',
			room: id,
		})
		this.gamesSocket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			console.log('games socket unhandled message', msg)
		})
		document.querySelector('web-rumble')?.newGame()
		document.querySelector('web-rumble')?.game.start()
		// this.querySelector('details').removeAttribute('open')
	}

	leaveRoom() {
		this.gamesSocket?.close()
		this.gamesSocket = null
		// this.querySelector('details').setAttribute('open', '')
		// this.render()
	}

	render() {
		const rooms = Object.entries(this.rooms.value).map(([id, count]) => ({id, count}))
		const totalConnections = Object.entries(this.rooms.value).reduce((acc, [id, count]) => acc + count, 0)
		const tpl = html`
			<details open>
				<summary>Lobby (${rooms.length} rooms, ${totalConnections} playing)</summary>
				<ul>
					${rooms?.length
						? html`${rooms.map(
								(room) => html`
									<li>
										${room.id} ${room.count && html`(${room.count})`}
										${room.id !== this.gamesSocket?.room
											? html` <button onclick=${() => this.joinRoom(room.id)}>Join</button> `
											: null}
									</li>
								`,
						  )}`
						: html`<li>No active rooms</li>`}
				</ul>
			</details>
			<p><button onclick=${() => this.createRoom()}>New Rumble</button></p>
			${this.gamesSocket
				? html`
						<p>
							You are in: ${this.gamesSocket?.room} <button onclick=${() => this.leaveRoom()}>Leave</button>
						</p>
				  `
				: null}
		`
		render(this, tpl)
	}
}
