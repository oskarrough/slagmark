export { render, html } from 'uhtml'

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

export function toPercent(value, max) {
	return Math.round((value / max) * 100)
}

/**
 * Returns a new, random number within -percentage and +percentage of the original.
 * e.g. naturalizeNumber(100, 0.1) returns a number between 90 and 110.
 */
export function naturalizeNumber(num = 0, percentage = 0.05) {
	const min = num + num * percentage
	const max = num - num * percentage
	return randomIntFromInterval(min, max)
}
