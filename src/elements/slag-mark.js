import {GameLoop} from '../nodes/game-loop.js'

/**
 * Coordinates the communication between all our things:
 - The <slag-mark-ui>
 - The <live-lobby>
 - The two websocket servers 
	*/
export class SlagMark extends HTMLElement {
	connectedCallback() {
		window.slagmark.el = this
		console.log('Slagmark! Debug with window.slagmark', window.slagmark)

		// We require a child <live-lobby> element for now.
		this.lobbyEl = this.querySelector('live-lobby')

		// We create <slag-mark-ui> and insert it. The UI() is rendered here.
		this.uiEl = document.createElement('slag-mark-ui')
		this.appendChild(this.uiEl)
	}

	disconnectedCallback() {
		this.game?.stop()
	}

	newGame(gamesSocket, roomId) {
		if (this.game) this.game.stop()
		this.game = GameLoop.new({element: this.uiEl, playerId: gamesSocket.id})
		this.game?.start()
		window.slagmark.game = this.game

		if (this.hasAttribute('ai')) {
			this.game.runAction({type: 'spawnAI'})
			this.game.runAction({type: 'startGameCountdown', countFrom: 3})
		}

		history.replaceState({room: roomId}, roomId, `?room=${roomId}`)
		console.log('newGame', roomId)
	}

	async quitGame() {
		console.log('quitGame', this.game)
		await this.game?.stop()
		this.game = null
		history.replaceState({}, '', '/')
		location.reload()
	}
}
