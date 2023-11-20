import {GameLoop} from './nodes.js'
import {render} from './utils.js'
import {UI} from './ui.js'

/** A custom element wrapper around the UI */
export class RumbleGame extends HTMLElement {
	connectedCallback() {
		if (this.hasAttribute('autoplay')) this.newGame()
	}

	newGame() {
		if (this.game) this.game.stop()
		this.game = GameLoop.new({element: this})
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
