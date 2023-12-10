import {Node, Reactive} from 'vroum'
import {render} from 'uhtml'
import {IntroScene, SinglePlayerScene, MultiplayerScene, ExitScene} from './scenes.js'

const sceneComponents = {
	intro: IntroScene,
	single: SinglePlayerScene,
	multi: MultiplayerScene,
	exit: ExitScene,
}

export class Scene extends Node {}

export class SceneManager extends Node {
	scene = Reactive()

	update(changed) {
		const scene = this.children.find((s) => s.id === changed.scene)
		this.renderScene(scene)
	}

	renderScene(scene) {
		console.log('rendering scene:', scene.id)
		const sceneComponent = sceneComponents[scene.id]
		if (sceneComponent) {
			const el = document.querySelector('slag-scenes')
			render(el, () => sceneComponent({manager: this, scene}))
			sceneComponent.animation && sceneComponent.animation()
		}
	}
}
