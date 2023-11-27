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
	}

	newGame(gamesSocket) {
		console.log('newGame')
		if (this.game) this.game.stop()
		// @todo reuse element
		const element = document.createElement('slag-mark-ui')
		this.appendChild(element)
		this.game = GameLoop.new({element})
		this.game?.start()
		const msg = {type: 'create'}
		gamesSocket.send(JSON.stringify(msg))
		return this.game
	}

	quitGame() {
		console.log('quitGame', this.game)
		if (!this.game) return
		this.game.stop()
		this.game.Renderer.render()
		this.game = null
	}
}
