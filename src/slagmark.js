import {GameLoop} from './nodes.js'

/**
 * Coordinates the communication between all our things:
 - The <slag-mark-ui>
 - The <live-lobby>
 - The two websocket servers 
	*/
export class SlagMark extends HTMLElement {
	connectedCallback() {
		window.slagmark = {el: this}
		console.log('window.slagmark', window.slagmark)
		this.lobbyEl = this.querySelector('live-lobby')
		this.uiEl = document.createElement('slag-mark-ui')
		this.appendChild(this.uiEl)
	}

	newGame(gamesSocket) {
		console.log('newGame')
		if (this.game) this.game.stop()
		this.game = GameLoop.new({element: this.uiEl})
		this.game?.start()
	}

	async quitGame() {
		console.log('quitGame', this.game)
		if (!this.game) return
		await this.game.stop()
		this.game.Renderer.render()
		this.game = null

		history.replaceState({}, '', '/')
		location.reload()
	}
}
