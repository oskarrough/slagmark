import PartySocket from 'partysocket'
import {render, html} from 'uhtml/keyed'
import {effect, signal} from 'usignal'
import {friendlyId} from '../stdlib/utils.js'
import {lobbySocket, PARTYKIT_URL} from '../stdlib/multiplayer.js'

/**
 * The lobby manages the "rooms" (or games) that are currently active.
 * You can create, join or leave a room. If you're the last to leave, the room will be removed.
 */
export class LiveLobby extends HTMLElement {
	constructor() {
		super()

		this.rooms = signal([])
		effect(() => {
			this.render(this.rooms)
		})

		lobbySocket.addEventListener('message', this.onLobbyMessage.bind(this))

		// Will be set in joinRoom()
		this.gamesSocket = null

		const urlParams = new URLSearchParams(window.location.search)
		if (urlParams.has('room')) {
			console.log('live-lobby joining room from URL')
			this.joinRoom(urlParams.get('room'))
		} else if (this.hasAttribute('autocreate')) {
			console.log('autocreating new game')
			this.openNewGame()
		}
	}

	onLobbyMessage(event) {
		const msg = JSON.parse(event.data)
		if (msg.type === 'connections') {
			this.rooms.value = msg.connections
		} else if (msg.type === 'presence') {
		} else if (msg.type === 'cursorUpdate') {
		} else {
			console.log('unhandled msg in lobby from main socket', msg)
		}
	}

	onGameMessage(event) {
		/** @type {import('../nodes.js').GameLoop} */
		const game = this.parentElement.game
		const action = JSON.parse(event.data)
		if (action.type === 'info') {
			// @todo show to user?
			console.info('👋', action.content)
		} else {
			game.runAction(action, false)
		}
	}

	openNewGame() {
		console.log('start new game')
		if (this.gamesSocket) this.leaveRoom()
		this.joinRoom(friendlyId())
	}

	joinRoom(id) {
		console.log('joinRoom', id)
		this.gamesSocket = new PartySocket({
			host: PARTYKIT_URL,
			party: 'games',
			room: id,
		})
		this.gamesSocket.addEventListener('message', this.onGameMessage.bind(this))
		this.parentElement.newGame(this.gamesSocket, id)
	}

	leaveRoom() {
		console.log('leaveRoom')
		this.gamesSocket?.close()
		this.gamesSocket = null
		this.parentElement.quitGame()
	}

	render(_) {
		const rooms = Object.entries(this.rooms.value).map(([id, count]) => ({id, count}))
		const totalConnections = Object.entries(this.rooms.value).reduce((acc, [id, count]) => acc + count, 0)
		const tpl = html`
			<slag-box>
				<details ?open=${!Boolean(this.gamesSocket)}>
					<summary>Lobby (<live-presence></live-presence> online, ${totalConnections} playing)</summary>
					${this.renderRooms(rooms)}
				</details>
			</slag-box>
			${this.gamesSocket
				? html`<p>You are in: <em>${this.gamesSocket?.room}</em></p>`
				: html`<menu><button onclick=${() => this.openNewGame()}>Open New Game</button></menu>`}
		`
		render(this, tpl)
	}

	renderRooms(rooms) {
		if (!rooms?.length) return html`<p>No active games at the moment. As far as we know.</p>`
		return html`
		<menu class="RoomList">${rooms.map(
			(room) => html`
				<button ?disabled=${room.id === this.gamesSocket?.room} onclick=${() => this.joinRoom(room.id)}>
					Join ${room.id} <small>${room.count && html`(${room.count})`}</small>
				</button>
			`
		)}</menu>`
	}
}
