import {GameLoop} from './nodes.js'
import {render} from './utils.js'

/** A custom element wrapper around the UI */
export class RumbleGame extends HTMLElement {
	connectedCallback() {
		if (this.hasAttribute('autoplay')) this.newGame()
	}

	newGame(gamesSocket) {
		console.log('newGame')
		if (this.game) this.game.stop()
		this.game = GameLoop.new({element: this})
		this.game?.start()

		const msg = {type: 'create'}
		gamesSocket.send(JSON.stringify(msg))

		return this.game
	}

	quitGame() {
		if (!this.game) return
		this.game.stop()
		this.game = null
	}
}
