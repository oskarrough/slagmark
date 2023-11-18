import {GameLoop} from './nodes.js'
import {render} from './utils.js'
import {UI} from './ui.js'

/** A custom element wrapper around the UI */
export class RumbleGame extends HTMLElement {
	connectedCallback() {
		// this.newGame()
	}

	newGame() {
		if (this.game) {
			console.log('force stopping game')
			this.game.stop()
		}
		const game = new GameLoop({element: this})
		this.game = game
		render(this, UI(this.game))

		if (this.getAttribute('autoplay')) {
			game.start()
			render(this, UI(game))
		}
	}
}
