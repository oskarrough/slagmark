import './style.css'
import {RumbleGame} from './rumble-game.js'
import {RumbleLobby} from './lobby.js'
import {LiveCursors} from './live-cusors.js'
import {LivePresence} from './live-presence.js'

customElements.define('rumble-game', RumbleGame)
customElements.define('rumble-lobby', RumbleLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)

window.slagmark = function() {
	const el = document.querySelector('rumble-game')
	return {
		game: el.game
	}
}
