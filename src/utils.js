export {render, html} from 'uhtml/keyed'
export {effect, signal} from 'usignal'

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

/**
 * Creates a random-looking string for ids.
 * @param {number} [a]
 * @returns {string}
 */
// export const uuid = () => crypto.randomUUID()
export function uuid(a) {
	return a
		? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
		: // @ts-ignore
		  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)
}
