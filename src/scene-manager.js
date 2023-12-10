import {Node, QueryAll, Closest, Reactive} from 'vroum'
import {render, html} from 'uhtml'

/**
 * Usage: mgtm = SceneManager.new({scenes: {MyScene, AnotherScene}})
 * mgtm.scene = 'AnotherScene' -> mgtm.update() -> scene.mount()
 */
export class SceneManager extends Node {
	Scenes = QueryAll(Scene)
	
	/** The current scene */
	scene = Reactive()

	/* A map of the available scene node classes */
	scenes = {}

	init() {
		this.element = document.querySelector('slag-scenes')
	}

	update(changed) {
		const scene = this.scenes[changed.scene]
		if (!scene) throw new Error('Missing scene: ' + changed.scene)
		this.children[0].replace(scene.new())
	}
}

export class Scene extends Node {
	Manager = Closest(SceneManager)

	mount() {
		console.log('scene mount', this.constructor.name)
		render(this.Manager.element, () => this.render())
		this.animate()
	}

	render() {
		return html``
	}

	animate() {}
}
