export class SlagMenu extends HTMLElement {
	connectedCallback() {
		this.addEventListener('mouseover', (event) => {
			const target = event.target.closest('a, button')
			if (target) {
				const x = target.dataset.beepover || 26
				beep(x, 0.1)
			}
		})
		this.addEventListener('click', (event) => {
			const target = event.target.closest('a, button')
			if (target) {
				const x = target.dataset.beep || 30
				beep(x, 0.1)
			}
		})
	}
}

/**
 * Plays a beep sound
 * @arg {string|number} n
 * @arg {number} [volume] - between 0 and 1, defaults to 1
 * Available beeps:
		 26 blib (skating on ice)
		 27 ok? bluuueb
		 28 "nop"
		 29 error
		 30 flimsy light, confirmed */
export function beep(n, volume = 1) {
	if (!n) return
	const audio = document.createElement('audio')
	audio.autoplay = true
	audio.volume = volume
	document.body.appendChild(audio)
	audio.src = `/sfx/cute-bleeps-${n}.wav`
	audio.addEventListener('ended', audio.remove)
}
