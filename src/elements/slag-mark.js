import {GameLoop, AIPlayer} from '../nodes.js'

/**
 * Coordinates the communication between all our things:
 - The <slag-mark-ui>
 - The <live-lobby>
 - Optional <slag-mark-ai>
 - The two websocket servers 
	*/
export class SlagMark extends HTMLElement {
	connectedCallback() {
		window.slagmark.el = this
		console.log('you can now debug window.slagmark', window.slagmark)
		this.lobbyEl = this.querySelector('live-lobby')
		this.uiEl = document.createElement('slag-mark-ui')
		this.appendChild(this.uiEl)
		this.aiEl = this.querySelector('slag-mark-ai')
	}

	disconnectedCallback() {
		this.game?.stop()
	}

	newGame(gamesSocket, roomId) {
		if (this.game) this.game.stop()
		this.game = GameLoop.new({element: this.uiEl, playerId: gamesSocket.id})
		this.game?.start()

		if (this.aiEl) {
			this.game.add(AIPlayer.new({number: 2}))
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
