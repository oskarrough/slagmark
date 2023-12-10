import {SlagMark} from './src/elements/slag-mark'
import {Stage} from './src/stdlib/scenes'

export {}

declare global {
	interface Window {
		slagmark: {
			stage: Stage
			el: SlagMark,
			volume: number
		}
	}
}
