import {SlagMark} from './elements/slag-mark.js'
import {SlagMenu} from './elements/slag-menu.js'
import {LiveLobby} from './elements/live-lobby.js'
import {LiveCursors} from './elements/live-cusors.js'
import {LivePresence} from './elements/live-presence.js'
import {CombatLog} from './elements/combat-log.js'
import {SceneManager, Scene} from './scene-manager.js'

// This is vite's way of importing CSS? Why?
import './styles/main.css'

// Register our web components
customElements.define('slag-mark', SlagMark)
customElements.define('slag-menu', SlagMenu)
customElements.define('live-lobby', LiveLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)
customElements.define('combat-log', CombatLog)

export const manager = SceneManager.new()

manager.add(
	Scene.new({id: 'intro'}),
	Scene.new({id: 'single'}),
	Scene.new({id: 'multi'}),
	Scene.new({id: 'exit'}),
)

// Choose and render the starting scene
const url = new URLSearchParams(location.search)
const room = url.get('room')

if (room === 'single') {
	manager.scene = 'single'
} else if (room) {
	manager.scene = 'multi'
} else {
	manager.scene = 'intro'
}

