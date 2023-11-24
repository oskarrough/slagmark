import './style.css'
import {RumbleGame} from './rumble-game.js'
import {RumbleLobby} from './lobby.js'
import {LiveCursors} from './live-cusors.js'
import {LivePresence} from './live-presence.js'
import {SlagMark} from './slagmark.js'

customElements.define('rumble-game', RumbleGame)
customElements.define('rumble-lobby', RumbleLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)
customElements.define('slag-mark', SlagMark)
