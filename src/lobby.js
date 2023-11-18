import {render, html, uuid} from './utils.js'
import {effect, signal} from 'usignal'
import PartySocket from 'partysocket'
import {PARTYKIT_URL} from './multiplayer.js'

/** A custom element wrapper around the UI */
export class RumbleLobby extends HTMLElement {
	constructor() {
		super()

		window.rumblelobby = this

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

		// The lobby socket
		// this.gamesSocket = new PartySocket({
		// 	host: PARTYKIT_URL,
		// 	party: 'games',
		// 	room: 'lobby',
		// })
		// this.gamesSocket.addEventListener('message', (event) => {
		// 	const msg = JSON.parse(event.data)
		// 	console.log('lobby', msg)
		// 	if (msg.type === 'join') {
		// 	}
		// 	if (msg.type === 'presence') {
		// 		this.rooms.value = msg.rooms
		// 	}
		// })

		// And the room socket (if/once a room is joined)
		this.roomSocket = null

		effect(() => {
			// console.log('rooms effect', this.rooms.value)
			this.render()
		})
	}

	createRoom() {
		// this.whateverSocket.send(JSON.stringify({type: 'create'}))
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
			if (msg.type === 'join') {
				this.render()
			}
			// if (msg.type === 'presence') {
			// 	this.rooms.value = msg.rooms
			// }
		})
	}

	leaveRoom() {
		this.gamesSocket?.close()
		this.gamesSocket = null
		console.log('@todo did we really leave?')
		this.render()
	}

	render() {
		const rooms = Object.entries(this.rooms.value).map(([id, count]) => ({id, count}))
		const lobby = this.rooms.value['lobby']
		const totalConnections = Object.entries(this.rooms.value).reduce((acc, [id, count]) => acc + count, 0)
		console.log('rendering rooms', rooms, totalConnections)
		const tpl = html`
			<h2>Lobby (${totalConnections})</h2>
			${this.gamesSocket && html`<p>You are in: ${this.gamesSocket?.room}</p>`}
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
			<p><button onclick=${() => this.createRoom()}>Create room</button></p>
		`
		render(this, tpl)
	}
}
