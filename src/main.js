import './style.css'
import {socket} from './multiplayer.js'
import {WebRumble} from './web-rumble.js'
import {LiveCursors} from './live-cusors.js'
import {LivePresence} from './live-presence.js'
import {RumbleLobby} from './lobby.js'

customElements.define('web-rumble', WebRumble)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)
customElements.define('rumble-lobby', RumbleLobby)

// for debugging
window.rumblesocket = socket

// Catch and handle messages from the server
socket.addEventListener('message', (event) => {
	const msg = JSON.parse(event.data)
	if (msg.type === 'presence') {
		window.rumblepresence = msg.count
		// handled by <live-presence>
	} else if (msg.type === 'cursorUpdate') {
		// handled by <live-cursors>
	} else {
		console.log('unhandled message', msg)
	}
})
