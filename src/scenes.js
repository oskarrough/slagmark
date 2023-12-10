import gsap from 'gsap'
import {html} from 'uhtml'

// @todo rewrite to "Scene" Nodes so we can use the same API as the other nodes

export function IntroScene({manager}) {
	const params = new URLSearchParams(location.search)
	if (params.has('room')) {
		params.delete('room')
		const url = new URL(location.href)
		url.search = params.toString()
		history.pushState({}, '', url)
	}

	return html`
		<slag-scene>
			<h1>Slagmark 🌐</h1>
			<slag-menu>
				<menu>
					<button type="button" onclick=${() => (manager.scene = 'single')}>Single Player †</button>
					<button type="button" onclick=${() => (manager.scene = 'multi')}>
						Multiplayer (<small><live-presence /> live</small>)
					</button>
					<button type="button" onclick=${() => (manager.scene = 'exit')} data-beepover="29" data-beep="28">
						╳
					</button>
					${Toggler()}
				</menu>
			</slag-menu>
		</slag-scene>
	`
}

export function SinglePlayerScene({manager}) {
	return html`
		<slag-scene>
			<menu tr>
				<button type="button" onclick=${() => (manager.scene = 'intro')}>↺</button>
			</menu>
			<slag-mark>
				<live-lobby autocreate></live-lobby>
				<slag-mark-ai></slag-mark-ai>
			</slag-mark>
		</slag-scene>
	`
}

export function MultiplayerScene({manager}) {
	return html`
		<slag-scene>
			<menu tr>
				<button type="button" onclick=${() => (manager.scene = 'intro')}>↺</button>
			</menu>
			<slag-mark>
				<live-lobby></live-lobby>
				<combat-log></combat-log>
			</slag-mark>
		</slag-scene>
	`
}

MultiplayerScene.animation = () => {
	return gsap
		.timeline()
		.set('body', {opacity: 1})
		.to('.Background', {autoAlpha: 0.2, scale: 1.2, duration: 1.5})
		.from('h1', {autoAlpha: 0, y: '-10%', duration: 0.8, ease: 'power2.out'}, '-=1.4')
		.from('menu', {autoAlpha: 0, y: -20, duration: 0.6, ease: 'power2.out'}, '-=1.3')
		.from('menu > *', {stagger: 0.05, y: -5, autoAlpha: 0, duration: 0.25, ease: 'power2.out'}, '-=1.2')
}

export function ExitScene({manager}) {
	return html`
		<slag-exit-scene>
			<h1>Slagmark 🌐</h1>
			<menu>
				<button type="button" onclick=${() => (manager.scene = 'intro')}>↺</button>
			</menu>
		</slag-exit-scene>
	`
}

IntroScene.animation = () => {
	return gsap
		.timeline()
		.set('body', {opacity: 1})
		.to('.Background', {autoAlpha: 1, scale: 1, duration: 1.5})
		.from('h1', {autoAlpha: 0, y: '-10%', duration: 0.8, ease: 'power2.out'}, '-=1.4')
		.from('menu', {autoAlpha: 0, y: -20, duration: 0.6, ease: 'power2.out'}, '-=1.3')
		.from('menu > *', {stagger: 0.05, y: -5, autoAlpha: 0, duration: 0.25, ease: 'power2.out'}, '-=1.2')
}

ExitScene.animation = () => {
	return gsap
		.timeline()
		.to('h1', {y: '-10%', autoAlpha: 0, duration: 1, ease: 'power2.out'}, '<')
		.to('.Background', {autoAlpha: 0.2, scale: 1.2, duration: 1}, '<')
}

function Toggler() {
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
