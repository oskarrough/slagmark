import {GameLoop} from './nodes.js'
import {render} from './utils.js'
import {UI} from './ui.js'

/** A custom element wrapper around the UI */
export class RumbleGame extends HTMLElement {
	connectedCallback() {
		this.newGame()
	}

	newGame() {
		const game = new GameLoop()
		game.element = this
		render(this, UI(game))

		// jump straight into a game
		// game.start()

		// references for later
		this.game = game
		window.rumble = game
	}
}
