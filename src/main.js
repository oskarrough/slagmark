import './style.css'
import {RumbleGame} from './rumble-game.js'
import {RumbleLobby} from './lobby.js'
import {LiveCursors} from './live-cusors.js'
import {LivePresence} from './live-presence.js'
// import {socket} from './multiplayer.js'

customElements.define('rumble-game', RumbleGame)
customElements.define('rumble-lobby', RumbleLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)

// Making sure all messages are caught somewhere.
// socket.addEventListener('message', (event) => {
// 	const msg = JSON.parse(event.data)
// 	if (msg.type === 'presence') {
// 		window.rumblepresence = msg.count // initial count to live-presence
// 		// handled by <live-presence>
// 	} else if (msg.type === 'cursorUpdate') {
// 		// handled by <live-cursors>
// 	} else if (msg.type === 'connections') {
// 		// handled by <rumble-lobby>	
// 	} else {
// 		console.log('main socket unhandled message', msg)
// 	}
// })
