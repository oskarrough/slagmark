import './style.css'
import {SlagMark} from './slagmark.js'
import {LiveLobby} from './live-lobby.js'
import {LiveCursors} from './live-cusors.js'
import {LivePresence} from './live-presence.js'

customElements.define('slag-mark', SlagMark)
customElements.define('live-lobby', LiveLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)
