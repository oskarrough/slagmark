import {Stage} from '../stdlib/scenes.js'

export class StageManager extends HTMLElement {
	stage = null

	constructor() {
		super()
		this.stage = Stage.new({element: this})
	}
}
