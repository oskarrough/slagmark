import {GameLoop} from './nodes.js'
// import {actions} from './actions.js'

/**
 * Coordinates the communication between all our things:
 - The <rumble-game>
 - The <rumble-lobby>
 - The two websocket servers 
	*/
export class SlagMark extends HTMLElement {
	// constructor() {
	// 	super()
	// 	const urlParams = new URLSearchParams(window.location.search)
	// 	this.debug = urlParams.has('debug')
	// }

	connectedCallback() {
		window.slagmark =  {el: this}
		console.log('window.slagmark', window.slagmark)
	}

	newGame(gamesSocket) {
		console.log('newGame')
		if (this.game) this.game.stop()
		const element = document.createElement('rumble-game')
		this.appendChild(element)
		console.log('element', element)
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
