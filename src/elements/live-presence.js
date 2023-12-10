import {render, html} from 'uhtml/keyed'
import {signal} from 'usignal'
import {lobbySocket} from '../multiplayer.js'

/*
 * Listens for "presence" events from the websocket server
 * and re-renders (via signals) the count to the DOM
 */
export class LivePresence extends HTMLElement {
	constructor() {
		super()

		// Count the number of connections to the main socket.
		this.count = signal(0)
		lobbySocket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			if (msg.type === 'presence') {
				this.count.value = msg.count
				this.render()
			}
		})
	}

	render() {
		render(this, html`${this.count.value}`)
	}
}
