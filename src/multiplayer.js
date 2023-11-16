import {html} from './utils.js'
import PartySocket from 'partysocket'
import throttle from 'lodash/throttle'

// Connect to the websocket server.
const PARTYKIT_URL =
	import.meta.env.MODE === 'production'
		? 'https://webrumble-party.oskarrough.partykit.dev'
		: 'http://localhost:1999'

const ROOM_ID = 'my-room' //uuid()

export const socket = new PartySocket({
	host: PARTYKIT_URL,
	room: ROOM_ID,
})

// Used to calculate cursor position.
const windowDimensions = {
	width: window.innerWidth,
	height: window.innerHeight,
}
// Auto-updating width/height.
const observer = new ResizeObserver(() => {
	windowDimensions.width = window.innerWidth
	windowDimensions.height = window.innerHeight
})
observer.observe(document.body)

// Renders a single cursor
export function Cursor(cursor) {
	const offset = 10 // why?
	const left = cursor.x * windowDimensions.width - offset
	const top = cursor.y * windowDimensions.height - offset
	const pointer = cursor.pointer ?? 'mouse'
	return html`
		<div
			class="Cursor"
			data-left=${left}
			data-top=${top}
			style=${`left: ${left}px; top: ${top}px`}
		>
			<img
				src=${`/${pointer === 'touch' ? 'pointer' : 'cursor'}.svg`}
				alt=${pointer}
			/>
			${pointer === 'touch' ? html`pointer` : html`cursor`}
		</div>
	`
}

const _sendPosition = (pos) => socket.send(JSON.stringify(pos))
const sendPosition = throttle(_sendPosition, 16, {trailing: true})

const getPosition = (e, pointerType) => {
	const touch = pointerType === 'touch'
	const clientX = touch ? e.touches[0].clientX : e.clientX
	const clientY = touch ? e.touches[0].clientY : e.clientY
	return {
		pointer: pointerType,
		x: clientX / windowDimensions.width,
		y: clientY / windowDimensions.height,
	}
}

const onPointerMove = (e) => {
	if (!socket) return
	const pointerType = e.type === 'touchmove' ? 'touch' : 'mouse'
	if (pointerType === 'touch') e.preventDefault()
	const position = getPosition(e, pointerType)
	sendPosition(position)
}

// Catch the end of touch events
const onTouchEnd = () => {
	if (!socket) return
	socket.send(JSON.stringify({}))
}

window.addEventListener('mousemove', onPointerMove)
window.addEventListener('touchmove', onPointerMove, {passive: false})
window.addEventListener('touchend', onTouchEnd)

