import {Task, Closest} from 'vroum'
import {render} from 'uhtml'
import {GameLoop} from '../nodes.js'
import {UI} from '../ui.js'

/** A utility task that renders the GameLoop constantly to a DOM node via the UI function */
export class Renderer extends Task {
	Game = Closest(GameLoop)

	tick() {
		if (!this.Game?.element) throw new Error('missing DOM element to render to')
		// const start = performance.now()
		render(this.Game.element, () => UI(this.root))
		// const end = performance.now()
		// console.log(`render time = ${end - start}ms`)
	}
}
