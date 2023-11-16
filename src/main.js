import {html, render} from './utils.js'
import {GameLoop} from './nodes.js'
import {UI} from './ui.js'
import {socket, Cursor} from './multiplayer.js'
import './index.css'

const game = new GameLoop()
game.element = document.querySelector('web-rumble')
window.game = game // for debugging
window.socket = socket

// Trigger a one-time render for the menu.
render(game.element, UI(game))

// Map of remotes cursors
// [id: string]: {id, pointer, x,y,lastUpdate}
const remoteCursors = {}

// Catch messages from the server
socket.addEventListener('message', (event) => {
	const msg = JSON.parse(event.data)
	// console.log('got message', msg)
	if (msg.type === 'cursorUpdate') {
		remoteCursors[msg.id] = msg
		render(document.querySelector('multi-player'), Cursors(remoteCursors))
	}
})

function Cursors(cursors) {
	return html`
		<div class="Cursors">
			${Object.entries(cursors).map(([_, cursor]) => Cursor(cursor))}
		</div>
	`
}
