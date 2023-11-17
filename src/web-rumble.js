import {GameLoop} from './nodes.js'
import {render} from './utils.js'
import {UI} from './ui.js'

/** A custom element wrapper around the UI */
export class WebRumble extends HTMLElement {
	connectedCallback() {
		this.newGame()
	}

	newGame() {
		const game = new GameLoop()
		game.element = this
		window.rumble = game
		render(this, UI(game))
	}
}
