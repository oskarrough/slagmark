import {Node} from 'vroum'

/**
 * Represents the battlefield, the slagmark on which minions move and fight.
 */
export class Board extends Node {
	/** The height can be used to globally tune the movement speed of the game.
	 * It does not currently affect the appearance of the board. */
	height = 10
	// @todo implement lanes
	// width = 1
}
