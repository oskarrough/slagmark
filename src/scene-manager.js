import gsap from 'gsap'
import {Node, Reactive} from 'vroum'
import {html, render} from 'uhtml'
import {signal, effect} from 'usignal'

export class Scene extends Node {}

export class SceneManager extends Node {
	currentScene = Reactive()

	update(changed) {
		const el = document.querySelector('slag-scenes')
		const scene = this.children.find((s) => s.id === changed.currentScene)
		if (scene.id === 'intro') render(el, IntroScene()) && IntroScene.animation()
		if (scene.id === 'single') render(el, SinglePlayerScene()) && MultiplayerScene.animation()
		if (scene.id === 'multi') render(el, MultiplayerScene()) && MultiplayerScene.animation()
		if (scene.id === 'exit') render(el, ExitScene()) && ExitScene.animation()
	}
}

function Toggler() {
	function handler({target}) {
		window.slagmarkVolume = target.checked ? 0.1 : 0
	}
	return html`
		<label custom
			>
			<input type="checkbox" checked onchange=${handler} />
			<span class="control control--checked">●</span>
			<span class="control control--unchecked">○</span> Sound
		</label>
	`
}

function IntroScene() {
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
					<button type="button" onclick=${() => (manager.currentScene = 'single')}>Single Player †</button>
					<button type="button" onclick=${() => (manager.currentScene = 'multi')}>
						Multiplayer (<small><live-presence /> live</small>)
					</button>
					<button
						type="button"
						onclick=${() => (manager.currentScene = 'exit')}
						data-beepover="29"
						data-beep="28"
					>
						╳
					</button>
					${Toggler()}
				</menu>
			</slag-menu>
		</slag-scene>
	`
}

function SinglePlayerScene() {
	return html`
		<slag-scene>
			<menu tr><button type="button" onclick=${() => (manager.currentScene = 'intro')}>↺</button></menu>
			<slag-mark>
				<live-lobby autocreate></live-lobby>
				<slag-mark-ai></slag-mark-ai>
			</slag-mark>
		</slag-scene>
	`
}

function MultiplayerScene() {
	// <button onclick=${() => (manager.currentScene = 'single')}>Play alone?</button>
	return html`
		<slag-scene>
			<menu tr><button type="button" onclick=${() => (manager.currentScene = 'intro')}>↺</button></menu>
			<slag-mark>
				<live-lobby></live-lobby>
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

function ExitScene() {
	return html`
		<slag-exit-scene>
			<h1>Slagmark 🌐</h1>
			<menu>
				<button type="button" onclick=${() => (manager.currentScene = 'intro')}>↺</button>
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

export const manager = SceneManager.new()
manager.add(
	Scene.new({id: 'intro'}),
	Scene.new({id: 'single'}),
	Scene.new({id: 'multi'}),
	Scene.new({id: 'exit'})
)
