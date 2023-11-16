import {render} from './utils.js'
import {GameLoop} from './nodes.js'
import {UI} from './ui.js'
import {socket} from './multiplayer.js'
import './index.css'
import {LiveCursors} from './live-cusors.js'

window.socket = socket

customElements.define(
	'web-rumble',
	class WebRumble extends HTMLElement {
		connectedCallback() {
			const game = new GameLoop()
			game.element = this
			window.game = game
			render(this, UI(game))
		}
	},
)

customElements.define('live-cursors', LiveCursors)

// Catch and handle messages from the server
socket.addEventListener('message', (event) => {
	const msg = JSON.parse(event.data)
	if (msg.type === 'welcome') {
		console.log(msg)
	} else if (msg.type === 'cursorUpdate') {
		// handled by <live-cursors>
	} else {
		console.log('unhandled message', msg)
	}
})
