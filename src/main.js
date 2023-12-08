import './style.css'

import {SlagMark} from './slagmark.js'
import {SlagMenu} from './slag-menu.js'

import {LiveLobby} from './live-lobby.js'
import {LiveCursors} from './live-cusors.js'
import {LivePresence} from './live-presence.js'

import {manager} from './scene-manager.js'

customElements.define('slag-mark', SlagMark)
customElements.define('slag-menu', SlagMenu)
customElements.define('live-lobby', LiveLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)

const url = new URLSearchParams(location.search)
const room = url.get('room')
if (room) {
	manager.currentScene = 'multi'
} else {
	manager.currentScene = 'intro'
}

console.log('READY', manager.currentScene)
