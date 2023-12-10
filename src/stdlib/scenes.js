import {Node, QueryAll, Closest, Reactive} from 'vroum'
import {render, html} from 'uhtml'

/**
 * Usage: mgtm = SceneManager.new({scenes: {MyScene, AnotherScene}})
 * mgtm.scene = 'AnotherScene' -> mgtm.update() -> scene.mount()
 */
export class Stage extends Node {
	Scenes = QueryAll(Scene)

	element = null

	/** The current scene */
	scene = Reactive()

	/* A map of the available scene node classes */
	scenes = {}

	update(changed) {
		const scene = this.scenes[changed.scene]
		if (!scene) throw new Error('Missing scene: ' + changed.scene)
		this.children?.length ? this.children[0].replace(scene.new()) : this.add(scene.new())
	}
}

export class Scene extends Node {
	Stage = Closest(Stage)

	mount() {
		console.log('scene mount', this.constructor.name)
		render(this.Stage.element, () => this.render())
		this.animate()
	}

	render() {
		return html``
	}

	animate() {}
}
