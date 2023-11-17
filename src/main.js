import './style.css'
import {socket} from './multiplayer.js'
import {WebRumble} from './web-rumble.js'
import {LiveCursors} from './live-cusors.js'

customElements.define('web-rumble', WebRumble)
customElements.define('live-cursors', LiveCursors)

// for debugging
window.rumblesocket = socket

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
