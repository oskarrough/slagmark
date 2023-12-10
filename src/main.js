import {SlagMark} from './elements/slag-mark.js'
import {SlagMenu} from './elements/slag-menu.js'
import {LiveLobby} from './elements/live-lobby.js'
import {LiveCursors} from './elements/live-cusors.js'
import {LivePresence} from './elements/live-presence.js'
import {CombatLog} from './elements/combat-log.js'
import {SceneManager} from './scene-manager.js'
import {Intro, SinglePlayer, Multiplayer, Exit} from './scenes.js'

const SCENES = {
	Intro,
	SinglePlayer,
	Multiplayer,
	Exit,
}

// This is vite's way of importing CSS? Why?
import './styles/main.css'

window.slagmark = window.slagmark || {}

// Register our web components
customElements.define('slag-mark', SlagMark)
customElements.define('slag-menu', SlagMenu)
customElements.define('live-lobby', LiveLobby)
customElements.define('live-cursors', LiveCursors)
customElements.define('live-presence', LivePresence)
customElements.define('combat-log', CombatLog)

// Create the scene manager unique to this game.
export const manager = SceneManager.new()
manager.update = (changed) => {
	const scene = SCENES[changed.scene]
	console.log(changed.scene, scene.constructor.name)
	manager.children[0].replace(scene.new())
	console.log('replaced', manager.children)
}
manager.add(Intro.new())
manager.connect()

window.slagmark.manager = manager

// Choose and render the starting scene
// const url = new URLSearchParams(location.search)
// const room = url.get('room')
// if (room === 'single') {
// 	manager.scene = 'Single'
// } else if (room) {
// 	manager.scene = 'Multi'
// } else {
// 	manager.scene = 'Intro'
// }
