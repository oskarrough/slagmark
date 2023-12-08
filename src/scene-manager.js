import gsap from 'gsap'
import {Node, QueryAll, Reactive} from 'vroum'
import {html, render} from 'uhtml'

export class Scene extends Node {}

export class SceneManager extends Node {
	Scenes = QueryAll(Scene)
	// ['intro', 'single', 'multi']
	currentScene = Reactive()

	update(changed) {
		const el = document.querySelector('slag-scenes')
		const scene = changed.currentScene
		if (scene === 'intro') render(el, IntroScene()) && IntroScene.animation()
		if (scene === 'single') render(el, SinglePlayerScene()) && fadein()
		if (scene === 'multi') render(el, MultiplayerScene()) && fadein()
		if (scene === 'exit') render(el, ExitScene()) && ExitScene.animation()
	}
}

function fadein() {
	const tl = gsap.timeline()
	tl.to('body', {autoAlpha: 1, duration: 1})
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
		<slay-intro-scene>
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
				</menu>
			</slag-menu>
		</slay-intro-scene>
	`
}
function SinglePlayerScene() {
	return html`
		<slay-scene>
			<menu tr><button type="button" onclick=${() => (manager.currentScene = 'intro')}>↺</button></menu>
			<slag-mark>
				<live-lobby autocreate></live-lobby>
			</slag-mark>
			<slag-mark>
				<live-lobby></live-lobby>
			</slag-mark>
		</slay-scene>
	`
}

function MultiplayerScene() {
	return html`
		<slay-scene>
			<menu tr><button type="button" onclick=${() => (manager.currentScene = 'intro')}>↺</button></menu>
			<slag-mark>
				<live-lobby autocreate></live-lobby>
			</slag-mark>
		</slay-scene>
	`
}

function ExitScene() {
	return html`
		<slay-exit-scene>
			<h1>Slagmark 🌐</h1>
			<menu>
				<button type="button" onclick=${() => (manager.currentScene = 'intro')}>↺</button>
			</menu>
		</slay-exit-scene>
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
