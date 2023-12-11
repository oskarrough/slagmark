// collections, objects, predicates, teams
import words from '../assets/words-smaller.json' assert {type: 'json'}

export function friendlyId() {
	return random(words.predicates) + '-' + random(words.objects)
}

/**
 * @param {Array} arr
 * @returns a random element from the array
 */
export function random(arr) {
	if (!Array.isArray(arr)) throw Error('Must be array')
	return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Returns rounded with one decimal
 */
export function roundOne(num) {
	return Math.round(num * 10) / 10
}

/**
 * Makes sure the number x is inside the lower and upper bounds.
 */
export function clamp(x, lower, upper) {
	return Math.max(lower, Math.min(x, upper))
}

/**
 *
 * @param {Number} value
 * @param {Number} max
 * @returns {Number} - in percent
 */
export function toPercent(value, max) {
	return Math.round((value / max) * 100)
}

/** Creates a random-looking string for ids */
export const uuid = () => crypto.randomUUID()
