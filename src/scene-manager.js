import {Node, Reactive} from 'vroum'
import {render, html} from 'uhtml'

export class SceneManager extends Node {
	scene = Reactive()

	update(changed) {
		console.log('scene update', changed.scene)
	}

	init() {
		this.element = document.querySelector('slag-scenes')
	}
}

/**
 * When a scene is added to the SceneManager, it will call mount() -> render() -> animate()
 */
export class Scene extends Node {
	mount() {
		console.log('scene mount', this.constructor.name)
		render(this.parent.element, () => this.render())
		this.animate()
	}

	render() { return html`` }
	animate() { return gsap.timeline() }
}
