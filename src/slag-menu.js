import {beep} from './audio.js'

export class SlagMenu extends HTMLElement {
	connectedCallback() {
		this.addEventListener('mouseover', (event) => {
			const target = event.target.closest('a, button')
			if (!target) return
			const x = target.dataset.beepover || 26
			beep(x)
		})
		this.addEventListener('click', (event) => {
			const target = event.target.closest('a, button')
			if (!target) return
			const x = target.dataset.beep || 30
			beep(x)
		})
	}

	render() {}
}
