import {html, render} from './utils.js'
import {signal} from 'usignal'
import {socket} from './multiplayer.js'

/*
 * Listens for "presence" events from the websocket server
 * and re-renders (via signals) the count to the DOM
 */
export class LivePresence extends HTMLElement {
	constructor() {
		super()

		// Count the number of connections to the main socket.
		this.count = signal(0)
		socket.addEventListener('message', (event) => {
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
