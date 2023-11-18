import words from './assets/words-smaller.json' assert {type: 'json'}

/**
 * @param {Array} arr
 * @returns a random element from the array
 */
export function random(arr) {
	if (!Array.isArray(arr)) throw Error('Must be array')
	return arr[Math.floor(Math.random() * arr.length)]
}

// collections, objects, predicates, teams

export function friendlyId() {
	return random(words.predicates) + '-' + random(words.objects)
}

