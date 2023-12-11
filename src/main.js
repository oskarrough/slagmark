import {SlagMark} from './elements/slag-mark.js'
import {SlagMenu} from './elements/slag-menu.js'
import {LiveLobby} from './elements/live-lobby.js'
import {LiveCursors} from './elements/live-cusors.js'
import {LivePresence} from './elements/live-presence.js'
import {CombatLog} from './elements/combat-log.js'
import {StageManager} from './elements/stage-manager.js'
import {Intro, SinglePlayer, Multiplayer, Exit} from './scenes.js'

// This is vite's way of importing CSS? Why?
import './styles/main.css'

// Register our web components
customElements.define('slag-mark', SlagMark)
customElements.define('slag-menu', SlagMenu)
customElements.define('live-lobby', LiveLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)
customElements.define('combat-log', CombatLog)
customElements.define('stage-manager', StageManager)

// For debuggig
window.slagmark = window.slagmark || {}

// Create the scene manager unique to this game.
const scenes = {
	Intro,
	SinglePlayer,
	Multiplayer,
	Exit,
}
const stageManager = document.querySelector('stage-manager')
stageManager.stage.scenes = scenes
stageManager.stage.connect()
window.slagmark.stage = stageManager.stage

// Choose and render the starting scene
const url = new URLSearchParams(location.search)
const room = url.get('room')
if (room) {
	stageManager.stage.scene = 'Multiplayer'
} else {
	stageManager.stage.scene = 'Intro'
}
