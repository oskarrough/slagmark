import {Task, Closest} from 'vroum'
import {GameLoop} from '../nodes.js'
import {beep} from '../stdlib/audio.js'
import {uuid, random} from '../stdlib/utils.js'
import {Player} from './player.js'

export const MINION_TYPES = ['rock', 'paper', 'scissors']

export class Minion extends Task {
	Game = Closest(GameLoop)
	Player = Closest(Player)

	id = null
	minionType = ''
	cost = 2
	y = -1
	defaultSpeed = 1.5
	minionTypes = MINION_TYPES
	// if true, it'll be removed after next tick
	shouldDisconnect = false

	get speed() {
		const s = this.defaultSpeed
		if (this.minionType === 'rock') return s * 0.8
		if (this.minionType === 'paper') return s * 1.2
		return s
	}

	constructor() {
		super()
		this.id = uuid()
		this.minionType = random(this.minionTypes)
	}

	/* @param {Minion} enemy */
	shouldFight(enemy) {
		const bufferZone = 0.5
		return !this.query(Fight) && !enemy.query(Fight) && Math.abs(this.y - enemy.y) <= bufferZone
	}

	tick() {
		if (!this.deployed || this.shouldDisconnect) return

		// Decide if we need to go up or down.
		const goingUp = this.Player.number === 1
		const startY = goingUp ? 0 : this.Game.Board.height
		const finalY = goingUp ? this.Game.Board.height : 0

		// Fight any enemies on same Y, and remove the loser.
		const opponent = this.Game.Players.find((p) => p !== this.Player)
		if (this.y !== startY && this.y !== finalY) {
			const enemies = opponent.Minions.filter((m) => this.shouldFight(m))
			for (const enemy of enemies) {
				this.add(Fight.new({enemy}))
			}
		}

		const reachedOppositeEnd = (goingUp && this.y >= finalY) || (!goingUp && this.y <= finalY)
		const fighting = this.query(Fight)

		// If not fighting or reached the end, we assume the minion is moving.
		if (!fighting && !reachedOppositeEnd) {
			this.move(goingUp ? 1 : -1)
		} else if (reachedOppositeEnd) {
			this.Game.runAction({type: 'minionReachedEnd', minionId: this.id, opponentPlayerId: opponent.id})
		}
	}

	afterCycle() {
		if (this.deployed && this.shouldDisconnect) this.disconnect()
	}

	/** Deploys to the starting side of the parent Player's board. */
	deploy() {
		const gold = this.Player.Gold
		if (gold.amount < this.cost) {
			console.log(`You need ${this.cost} gold to deploy this minion`)
			return
		}
		gold.decrement(this.cost)
		this.y = this.Player.number === 1 ? 0 : this.Game.Board.height
		this.deployed = this.Game.elapsedTime
		beep('bleep-26.wav')
	}

	move(direction = 1) {
		const D = this.Game.deltaTime / 1000
		this.y += this.speed * D * direction
	}
}

export class Fight extends Task {
	delay = 0
	duration = 0
	// interval = 0
	repeat = 1

	Minion = Closest(Minion)

	/** @type {Minion} */
	enemy = null

	mount() {
		console.log('fight mount', this.Minion?.minionType, 'vs', this.enemy?.minionType, this)
		if (!this.parent) {
			console.log('this should not happen', this)
			this.disconnect()
			return
		}
		// if (this.enemy) this.enemy.add(Fight.new())
		// beep('bleep-29.wav')
	}

	tick() {
		console.log('fight tick', this.Minion.y, this.Minion.minionType, 'vs', this.enemy?.minionType)
	}

	afterCycle() {
		console.log('fight afterCycle', this.Minion.y, this.Minion.minionType, 'vs', this.enemy?.minionType)
		if (this.enemy) {
			const loser = this.fight()
			this.Minion.Game.runAction({
				type: 'minionFight',
				loserId: loser.id,
				minionId: this.Minion.id,
				enemyId: this.enemy.id,
			})
		}
	}

	/**
	 * Returns the losing minion, if tie it picks a random loser
	 */
	fight() {
		const minion = this.Minion
		const enemy = this.enemy
		if (!enemy) throw new Error('missing enemy')
		console.log('fight fight', minion.y, minion.minionType, 'vs', enemy.minionType)
		const winningCombos = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		}
		if (winningCombos[this.Minion.minionType] === enemy.minionType) {
			return enemy
		} else if (winningCombos[enemy.minionType] === this.Minion.minionType) {
			return this
		} else {
			return random([this, enemy])
		}
	}
}
