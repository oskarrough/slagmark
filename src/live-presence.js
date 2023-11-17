import {html, render} from './utils.js'
import {effect, signal} from 'usignal'
import {socket} from './multiplayer.js'

/*
 * Listens for "presence" events from the websocket server
 * and re-renders (via signals) the count to the DOM*/
export class LivePresence extends HTMLElement {
	constructor() {
		super()

		this.count = signal(window.rumblepresence)

		socket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			if (msg.type === 'presence') {
				this.count.value = msg.count
			}
		})
	}

	connectedCallback() {
		this.render()
	}

	render() {
		effect(() => {
			render(this, html`${this.count.value}`)
		})
	}
}
