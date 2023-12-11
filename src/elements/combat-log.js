import {signal, effect} from 'usignal'
import {html} from 'uhtml'

export class CombatLog extends HTMLElement {
	constructor() {
		super()
		this.logs = signal([])
		effect(() => {
			this.render(this.logs)
		})
	}
	connectedCallback() {
		this.render()
	}
	render(logs) {
		if (!logs?.length) return html``
		// render(
		// 	this.element,
		// 	html`
		// 		<details open>
		// 			<summary></summary>
		// 			<ul>
		// 				${logs.map((log) => html`<li>hello ${log.now}</li>`)}
		// 			</ul>
		// 		</details>
		// 	`,
		// )
	}
}
