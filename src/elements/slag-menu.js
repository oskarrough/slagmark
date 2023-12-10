import {beep} from '../stdlib/audio.js'

export class SlagMenu extends HTMLElement {
	connectedCallback() {
		this.addEventListener('mouseover', (event) => {
			const target = event.target.closest('a, button')
			if (!target) return
			const x = `bleep-${target.dataset.beepover || 26}.wav`
			beep(x)
		})
		this.addEventListener('click', (event) => {
			const target = event.target.closest('a, button')
			if (!target) return
			const x = `bleep-${target.dataset.beep || 30}.wav`
			beep(x)
		})
	}

	render() {}
}
