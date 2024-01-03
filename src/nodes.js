import {Task, Closest} from 'vroum'
import {GameLoop} from './nodes/game-loop.js'
import {Gold, RefillMinions} from './nodes/player.js'

/** Used (required) to start a game with an optional countdown */
export class StartCountdown extends Task {
	/** @type {string|number} */
	count = null

	delay = 1000
	duration = 0
	interval = 1000
	repeat = 4 // put it on higher than you'd like because of the "delay"

	tick() {
		this.count = this.repeat - 1 - this.cycles
		if (this.count > 0) {
			// count
		} else {
			// final tick
			this.root.add(GameStart.new())
		}
	}
}

export class GameStart extends Task {
	Game = Closest(GameLoop)

	duration = 0
	repeat = 1

	tick() {
		this.Game.Players.forEach((player) => {
			player.add(Gold.new())
			player.add(RefillMinions.new())
		})
		// this.Game.$start()
	}
}
