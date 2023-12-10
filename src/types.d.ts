export {}

declare global {
	interface Window {
		slagmark: {
			manager: SlagmarkManager,
			el: HTMLElement
		},
		slagmarkVolume: number
	}
}