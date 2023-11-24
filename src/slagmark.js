/**
 * Coordinates the communication between all our things:
 - The <rumble-game>
 - The <rumble-lobby>
 - The two websocket servers 
	*/
export class SlagMark extends HTMLElement {
	constructor() {
		super()
		const urlParams = new URLSearchParams(window.location.search)
		this.debug = urlParams.has('debug') 
	}

	connectedCallback() {
		const gameEl = this.querySelector('rumble-game')
		const lobbyEl = this.querySelector('rumble-lobby')
		window.slagmark = {
			gameEl,
			lobbyEl,
		}
		console.log('SLAGMARK', window.slagmark)
	}
}

