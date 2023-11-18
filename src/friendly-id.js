// collections, objects, predicates, teams
import words from './assets/words-smaller.json' assert {type: 'json'}
import {random} from './utils.js'

export function friendlyId() {
	return random(words.predicates) + '-' + random(words.objects)
}
