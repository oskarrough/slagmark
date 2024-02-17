import posthog from 'posthog-js'

/** @typedef {import('../actions.js').Action} Action */
/** @typedef {{now: number, action: Action}} LogEntry */

posthog.init('phc_ei2CC0bZ00qsXXAU0aJh6b2liRL6poNgxFDRAKLRKc1', {api_host: 'https://eu.posthog.com'})

/**
 * Used to track what has happened in a game.
 * You can store "actions" here, but any object goes.
 */
export class Logger {
	/** @type {LogEntry[]} */
	logs = []

	/**
	 * @arg {Action} action
	 * @arg {object} [result]
	 */
	push(action, result) {
		const log = {now: Date.now(), action, action_result: result}
		this.logs.push(log)
		posthog.capture(action.type, log)
	}

	print() {
		console.log(this.logs)
	}
}
