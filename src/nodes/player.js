import {Task, Query, QueryAll, Closest} from 'vroum'
import {random, uuid} from '../stdlib/utils.js'
import {GameLoop} from './game-loop.js'
import {Minion, MINION_TYPES} from './minion.js'

export class Player extends Task {
	Game = Closest(GameLoop)
	Minions = QueryAll(Minion)
	Gold = Query(Gold)

	health = 3
	number = 0 // used to determine who is above, who is below on the slagmark

	afterCycle() {
		if (this.health <= 0) {
			this.Game.runAction({type: 'gameOver', losingSerializedPlayer: this.serialize()})
		}
	}

	serialize() {
		const {id, number, health} = this
		return {id, number, health, gold: this.Gold?.amount}
	}
}

export class AIPlayer extends Player {
	build() {
		this.id = uuid()

		return [
			// Gold.new(),
			// By letting this create the minions, it goes through websockets..
			RefillMinions.new(),
			DeployMinions.new(),
		]
	}
}

class DeployMinions extends Task {
	Player = Closest(Player)
	delay = 0
	interval = 2200
	duration = 0

	tick() {
		const gold = this.Player.Gold?.amount
		const minions = this.Player.Minions.filter((m) => m instanceof Minion).filter(
			(m) => !m.deployed && m.cost <= gold,
		)
		const minion = random(minions)
		if (minion) {
			this.Player.Game.runAction({type: 'deployMinion', minionId: minion?.id})
		}
	}
}

/**
 * Adds 1 gold every {interval} seconds (if we have less than 10)
 */
export class Gold extends Task {
	duration = 0
	interval = 1000

	amount = 0
	maxAmount = 10

	tick() {
		this.increment()
	}

	increment(value = 1) {
		if (this.amount === this.maxAmount) return
		this.amount = this.amount + value
	}

	decrement(value = 1) {
		if (this.amount < 2) return 0
		this.amount = this.amount - value
	}
}

/** Adds a new minion to the parent every {interval} seconds (if we have less than 4) */
export class RefillMinions extends Task {
	Game = Closest(GameLoop)
	Player = Closest(Player)

	duration = 0
	interval = 3000
	maxAmount = 4

	tick() {
		const undeployedMinions = this.Player.Minions.filter((m) => !m.deployed)?.length
		if (undeployedMinions < this.maxAmount) {
			this.Game.runAction({type: 'createMinion', playerId: this.Player.id, minionType: random(MINION_TYPES)})
		}
	}
}
