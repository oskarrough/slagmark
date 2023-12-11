import {beep} from '../stdlib/audio.js'

export class SlagMenu extends HTMLElement {
	connectedCallback() {
		this.enableBleepSounds()
	}

	enableBleepSounds() {
		function mouseenter(event) {
			const x = `bleep-${event.target.dataset.beepover || 26}.wav`
			beep(x)
		}
		function click(event) {
			const x = `bleep-${event.target.dataset.beep || 30}.wav`
			beep(x)
		}
		const items = this.querySelectorAll('a, button')
		items.forEach((item) => {
			item.addEventListener('mouseenter', mouseenter)
			item.addEventListener('click', click)
		})
	}

	render() {}
}
