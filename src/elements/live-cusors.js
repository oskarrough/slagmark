import throttle from 'lodash/throttle'
import {render, html} from 'uhtml/keyed'
import {lobbySocket} from '../stdlib/multiplayer.js'

const sendObject = (pos) => lobbySocket.send(JSON.stringify(pos))
const throttledSend = throttle(sendObject, 16, {trailing: true})

/**
 * Continously send local pointer position to the websocket server.
 * Collect all positions from the server (cursorUpdate + cursorRemove)
 * and render them.
 */
export class LiveCursors extends HTMLElement {
	constructor() {
		super()
		// [id: string]: {id, pointer, x,y}
		this.cursors = {}
	}

	connectedCallback() {
		window.addEventListener('mousemove', this.onPointerMove, {passive: true})
		window.addEventListener('touchmove', this.onPointerMove, {passive: false})
		window.addEventListener('touchend', this.onTouchEnd)

		// Used to calculate cursor position.
		this.dimensions = {
			width: window.innerWidth,
			height: window.innerHeight,
		}

		// Recalculate dimensions on resize.
		const observer = new ResizeObserver(() => {
			this.dimensions.width = window.innerWidth
			this.dimensions.height = window.innerHeight
		})
		observer.observe(document.body)

		// Catch and handle messages from the server.
		lobbySocket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			if (msg.type === 'cursorUpdate') {
				this.cursors[msg.id] = msg
				this.render()
			} else if (msg.type === 'cursorRemove') {
				console.log('deleted cursor', msg.id)
				delete this.cursors[msg.id]
				this.render()
			}
		})

		// Initial one-time render.
		this.render()
	}

	onPointerMove = (e) => {
		if (!lobbySocket) return
		const pointerType = e.type === 'touchmove' ? 'touch' : 'mouse'
		if (pointerType === 'touch') e.preventDefault()
		const position = this.getPosition(e, pointerType)
		throttledSend(position)
	}

	// Catch the end of touch events. Allows the server to detect and remove the cursor.
	onTouchEnd = () => {
		if (!lobbySocket) return
		lobbySocket.send(JSON.stringify({}))
	}

	getPosition = (e, pointerType) => {
		const touch = pointerType === 'touch'
		const clientX = touch ? e.touches[0].clientX : e.clientX
		const clientY = touch ? e.touches[0].clientY : e.clientY
		return {
			pointer: pointerType,
			x: clientX / this.dimensions.width,
			y: clientY / this.dimensions.height,
		}
	}

	render() {
		const cursors = Object.entries(this.cursors)
		if (!cursors.length) return
		render(this, html`${Object.entries(this.cursors).map(([_, cursor]) => this.renderCursor(cursor))}`)
	}

	renderCursor(cursor) {
		const offset = 10 // why?
		const left = cursor.x * this.dimensions.width - offset
		const top = cursor.y * this.dimensions.height - offset
		const pointer = cursor.pointer ?? 'mouse'
		return html`
			<div class="Cursor" style=${`left: ${left}px; top: ${top}px`}>
				<img src=${`/${pointer === 'touch' ? 'pointer' : 'cursor'}.svg`} alt=${pointer} />
				${pointer === 'touch' ? html`pointer` : html`mouse`}
			</div>
		`
	}
}
