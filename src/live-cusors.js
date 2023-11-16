import throttle from 'lodash/throttle'
import {html, render} from './utils.js'
import {socket} from './multiplayer.js'

const sendObject = (pos) => socket.send(JSON.stringify(pos))
const throttledSend = throttle(sendObject, 16, {trailing: true})

// [id: string]: {id, pointer, x,y,lastUpdate}
const CURSORS = {}

/**
 * Send cursor position to the server via websockets.
 * Collect all cursor positions from the server and render them.
 */
export class LiveCursors extends HTMLElement {
	connectedCallback() {
		window.addEventListener('mousemove', this.onPointerMove)
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

		// Initial one-time render.
		this.render()

		// Catch and handle messages from the server.
		socket.addEventListener('message', (event) => {
			const msg = JSON.parse(event.data)
			if (msg.type === 'cursorUpdate') {
				CURSORS[msg.id] = msg
				this.render()
			}
		})
	}

	onPointerMove = (e) => {
		if (!socket) return
		const pointerType = e.type === 'touchmove' ? 'touch' : 'mouse'
		if (pointerType === 'touch') e.preventDefault()
		const position = this.getPosition(e, pointerType)
		throttledSend(position)
	}

	// Catch the end of touch events. Dunno why we need this.
	onTouchEnd = () => {
		if (!socket) return
		socket.send(JSON.stringify({}))
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
		render(this, html`${Object.entries(CURSORS).map(([_, cursor]) => this.renderCursor(cursor))}`)
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
