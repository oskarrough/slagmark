import gsap from 'gsap'
import {html} from 'uhtml'
import {Scene} from './elements/scene-manager.js'

export class Intro extends Scene {
	render() {
		const params = new URLSearchParams(location.search)
		if (params.has('room')) {
			console.log('intro scene is clearing room param')
			params.delete('room')
			const url = new URL(location.href)
			url.search = params.toString()
			history.pushState({}, '', url)
		}
		const mgtm = this.Manager
		return html`
			<slag-scene>
				<h1>Slagmark 🌐</h1>
				<slag-menu>
					<menu>
						<button type="button" onclick=${() => (mgtm.scene = 'SinglePlayer')}>Single Player †</button>
						<button type="button" onclick=${() => (mgtm.scene = 'Multiplayer')}>
							Multiplayer (<small><live-presence /> live</small>)
						</button>
						<button type="button" onclick=${() => (mgtm.scene = 'Exit')} data-beepover="29" data-beep="28">
							╳
						</button>
						${SoundToggle()}
					</menu>
				</slag-menu>
			</slag-scene>
		`
	}

	animate() {
		return gsap
			.timeline()
			.set('body', {opacity: 1})
			.to('.Background', {autoAlpha: 1, scale: 1, duration: 1.5})
			.from('h1', {autoAlpha: 0, y: '-10%', duration: 0.8, ease: 'power2.out'}, '-=1.4')
			.from('menu', {autoAlpha: 0, y: -20, duration: 0.6, ease: 'power2.out'}, '-=1.3')
			.from('menu > *', {stagger: 0.05, y: -5, autoAlpha: 0, duration: 0.25, ease: 'power2.out'}, '-=1.2')
	}
}

export class SinglePlayer extends Scene {
	render() {
		return html`
			<slag-scene>
				<menu tr>
					<button type="button" onclick=${() => (this.Manager.scene = 'Intro')}>↺</button>
				</menu>
				<slag-mark>
					<live-lobby autocreate></live-lobby>
					<slag-mark-ai></slag-mark-ai>
				</slag-mark>
			</slag-scene>
		`
	}
}

export class Multiplayer extends Scene {
	render() {
		return html`
			<slag-scene>
				<menu tr>
					<button type="button" onclick=${() => (this.Manager.scene = 'Intro')}>↺</button>
				</menu>
				<slag-mark>
					<live-lobby></live-lobby>
					<combat-log></combat-log>
				</slag-mark>
			</slag-scene>
		`
	}
	animate() {
		return gsap
			.timeline()
			.set('body', {opacity: 1})
			.to('.Background', {autoAlpha: 0.2, scale: 1.2, duration: 1.5})
			.from('h1', {autoAlpha: 0, y: '-10%', duration: 0.8, ease: 'power2.out'}, '-=1.4')
			.from('menu', {autoAlpha: 0, y: -20, duration: 0.6, ease: 'power2.out'}, '-=1.3')
			.from('menu > *', {stagger: 0.05, y: -5, autoAlpha: 0, duration: 0.25, ease: 'power2.out'}, '-=1.2')
	}
}

export class Exit extends Scene {
	render() {
		return html`
			<slag-scene>
				<h1>Slagmark 🌐</h1>
				<menu>
					<button type="button" onclick=${() => (this.Manager.scene = 'Intro')}>↺</button>
				</menu>
			</slag-scene>
		`
	}
	animate() {
		return gsap
			.timeline()
			.to('h1', {y: '-10%', autoAlpha: 0, duration: 0.6, ease: 'power2.out'}, '<')
			.to('.Background', {autoAlpha: 0.2, scale: 1.2, duration: 1}, '-=0.6')
	}
}

function SoundToggle() {
	function handler({target}) {
		window.slagmarkVolume = target.checked ? 0.1 : 0
	}
	return html`
		<label custom>
			<input type="checkbox" ?checked=${window.slagmarkVolume} onchange=${handler} />
			<span class="control control--checked">●</span>
			<span class="control control--unchecked">○</span> Sound
		</label>
	`
}
