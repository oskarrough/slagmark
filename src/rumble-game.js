import {GameLoop} from './nodes.js'
import {render} from './utils.js'
import {UI} from './ui.js'

/** A custom element wrapper around the UI */
export class RumbleGame extends HTMLElement {
	connectedCallback() {
		this.render()
	}

	newGame() {
		if (this.game) {
			console.log('force stopping game before starting a new')
			this.game.stop()
		}
		this.game = new GameLoop({element: this})
		this.render()
	}

	quitGame() {
		if (!this.game) return
		this.game.stop()
		this.game = null
		this.render()
	}

	render() {
		render(this, UI(this.game))
	}
}
