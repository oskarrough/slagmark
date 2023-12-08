import gsap from 'gsap'
import {Node, QueryAll, Reactive} from 'vroum'
import {html, render} from 'uhtml'

export class Scene extends Node {}

export class SceneManager extends Node {
	Scenes = QueryAll(Scene)
	// ['intro', 's<F4>ingle', 'multi']
	currentScene = Reactive()

	update(changed) {
		const el = document.querySelector('slag-scenes')
		const scene = changed.currentScene
		if (scene === 'intro') render(el, IntroScene()) && IntroScene.animation()
		if (scene === 'single') render(el, SinglePlayerScene()) && fadein()
		if (scene === 'multi') render(el, MultiplayerScene()) && fadein()
		if (scene === 'quit') render(el, ExitScene()) && ExitScene.animation()
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
					<button type="button" onclick=${() => (manager.currentScene = 'multi')}>Multiplayer ††</button>
					<button
						type="button"
						onclick=${() => (manager.currentScene = 'quit')}
						data-beepover="29"
						data-beep="28"
					>
						Quit ╳
					</button>
				</menu>
			</slag-menu>
			<div class="Background"></div>
		</slay-intro-scene>
	`
}
IntroScene.animation = () => {
	return gsap
		.timeline()
		.set('body', {opacity: 1})
		.from('.Background', {autoAlpha: 0, scale: 1.05, duration: 1.5})
		.from('h1', {autoAlpha: 0, y: -260, duration: 0.8, rotate: '-3deg', ease: 'power2.out'}, '-=1')
		.from('menu', {autoAlpha: 0, y: -20, duration: 0.6, ease: 'power2.out'}, '-=0.6')
		.from('menu > *', {stagger: 0.05, y: -5, autoAlpha: 0, duration: 0.25, ease: 'power2.out'}, '-=0.6')
}

function SinglePlayerScene() {
	return html`
		<slay-scene>
			<button type="button" onclick=${() => (manager.currentScene = 'intro')}>Exit</button>
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
			<button type="button" onclick=${() => (manager.currentScene = 'intro')}>Exit</button>
			<slag-mark>
				<live-lobby autocreate></live-lobby>
			</slag-mark>
		</slay-scene>
	`
}

function ExitScene() {
	return html`
		<slay-intro-scene>
			<h1>Slagmark 🌐</h1>
			<menu>
				<button type="button" onclick=${() => (manager.currentScene = 'single')}>Single Player †</button>
				<button type="button" onclick=${() => (manager.currentScene = 'multi')}>Multiplayer ††</button>
				<button type="button" onclick=${() => (manager.currentScene = 'quit')} data-beep="28">Quit ╳</button>
			</menu>
			<div class="Background"></div>
		</slay-intro-scene>
	`
}
ExitScene.animation = () => {
	const menu = document.querySelector('menu')
	const title = document.querySelector('h1')
	const background = document.querySelector('.Background')
	return gsap
		.timeline()
		.to(menu, {scale: 0, autoAlpha: 0, y: '-50%', duration: 1})
		.to(title, {y: '-10%', autoAlpha: 0, duration: 1, ease: 'power2.out'}, '<')
		.to(background, {scale: 1.2, filter: 'brightness(1)', duration: 60}, '<')
}

export const manager = SceneManager.new()
manager.add(
	Scene.new({id: 'intro'}),
	Scene.new({id: 'single'}),
	Scene.new({id: 'multi'}),
	Scene.new({id: 'exit'})
)
