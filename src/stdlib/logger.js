import {Node} from 'vroum'

/** @typedef {import('../actions.js').Action} Action */
/** @typedef {{now: number, action: Action}} LogEntry */

export class Logger extends Node {
	/** @type {LogEntry[]} */
	logs = []

	/** @arg {Action} action */
	push(action) {
		const log = {action, now: Date.now()}
		this.logs.push(log)
	}

	print() {
		console.log(this.logs)
	}
}
