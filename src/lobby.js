import {render, html, uuid} from './utils.js'
import {effect, signal} from 'usignal'
import PartySocket from 'partysocket'
import {PARTYKIT_URL} from './multiplayer.js'

/** A custom element wrapper around the UI */
export class RumbleLobby extends HTMLElement {
	constructor() {
		super()
		this.rooms = signal([])
		this.whateverSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'whatever',
			room: 'active-connections',
		})
		this.whateverSocket.addEventListener('message', (event) => {
			const connections = JSON.parse(event.data)
			console.log('got connections', connections)
			this.rooms.value = connections
		})
		window.rumblelobby = this
		effect(() => {
			this.render()
		})
	}

	createRoom() {
		this.leaveRoom()
		this.joinRoom(uuid())
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
			console.log('games socket', msg)
		})
		document.querySelector('web-rumble')?.newGame()
		document.querySelector('web-rumble')?.game.start()
		this.querySelector('details').removeAttribute('open')
	}

	leaveRoom() {
		this.gamesSocket?.close()
		this.gamesSocket = null
		this.querySelector('details').setAttribute('open', '')
		this.render()
	}

	render() {
		const rooms = Object.entries(this.rooms.value).map(([id, count]) => ({id, count}))
		const totalConnections = Object.entries(this.rooms.value).reduce((acc, [id, count]) => acc + count, 0)
		const tpl = html`
			<details open>
				<summary><h2>Lobby (${totalConnections})</h2></summary>
				<ul>
					${rooms?.length
						? rooms.map(
								(room) => html`
									<li>
										${room.id} ${room.count && html`(${room.count})`}
										${room.id === this.gamesSocket?.room
											? html` <button onclick=${() => this.leaveRoom()}>Leave</button> `
											: html` <button onclick=${() => this.joinRoom(room.id)}>Join</button> `}
									</li>
								`,
						  )
						: [html`<li>It's empty here..</li>`]}
				</ul>
			</details>
			${this.gamesSocket ? html`<p>You are in: ${this.gamesSocket?.room}</p>` : html`<p>Let's go!</p>`}
			<p><button onclick=${() => this.createRoom()}>New Rumble</button></p>
		`
		render(this, tpl)
	}
}
