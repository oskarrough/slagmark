import {render, html, uuid} from './utils.js'
import {effect, signal} from 'usignal'
import PartySocket from 'partysocket'
import {PARTYKIT_URL} from './multiplayer.js'

/** A custom element wrapper around the UI */
export class RumbleLobby extends HTMLElement {
	constructor() {
		super()

		window.rumblelobby = this

		// The lobby socket
		this.gamesSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'games',
			room: 'lobby',
		})
		this.gamesSocket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			console.log('lobby', msg)
			if (msg.type === 'join') {
			}
			if (msg.type === 'presence') {
				this.rooms.value = msg.rooms
			}
		})
		this.rooms = signal([])

		// And the room socket (if/once a room is joined)
		this.roomSocket = null

		effect(() => {
			// console.log('rooms effect', this.rooms.value)
			this.render()
		})
	}

	createRoom() {
		this.gamesSocket.send(JSON.stringify({type: 'create'}))
	}

	async joinRoom(id) {
		this.roomSocket?.close()
		this.roomSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'games',
			room: id,
		})
		this.roomSocket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			console.log('room', msg)
			if (msg.type === 'join') {
				this.render()
			}
			if (msg.type === 'presence') {
				this.rooms.value = msg.rooms
			}
		})
	}
	
	leaveRoom() {
		this.roomSocket?.close()
		this.roomSocket = null
		console.log('@todo did we really leave?')
		this.render()
	}

	render() {
		const rooms = this.rooms.value
		const lobby = this.rooms.value.find((room) => room.id === 'lobby')
		console.log('rendering rooms', rooms)
		const tpl = html`
			<h2>Lobby (${lobby?.count})</h2>
			${this.roomSocket && html`<p>You are in: ${this.roomSocket?.room}</p>`}
			<ul>
				${rooms?.length
					? rooms.map(
							(room) => html`
								<li>
									${room.id} ${room.count && html`(${room.count})`}
									${room.id === this.roomSocket?.room
										? html` <button onclick=${() => this.leaveRoom()}>Leave</button> `
										: html` <button onclick=${() => this.joinRoom(room.id)}>Join</button> `}
								</li>
							`,
					  )
					: [html`<li>It's empty here..</li>`]}
			</ul>
			<p><button onclick=${() => this.createRoom()}>Create room</button></p>
		`
		render(this, tpl)
	}
}
