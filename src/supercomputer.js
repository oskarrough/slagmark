import {GameLoop} from './nodes.js'

const game = GameLoop.new()

// Add a new method to run an action
game.runAction = (action) => {
	const handler = actions[action.type]
	if (!handler) throw new Error('Missing action', action)
	return handler(game, action)
}

// Our global map of actions for consistency
const actions = {
	createGame() {
		return {type: 'CREATE_GAME'}
	},
	deployMinion({id}) {
		return {type: 'DEPLOY_MINION', id}
	}
}

// A local client connection to the websocket server
const socket = {}

socket.addEventListener('message', (event) => {
	const action = JSON.parse(event.data)
	game.runAction(action)
})

// The UI
<button onclick=${deploy}>Deploy minion</button>

function deploy() {
	const action = actions.deployMinion({id: 'abc'})
	// Update local state
	game.runAction(action)
	// Alert other parties of the action
	socket.send(action)
}

// Fake code to represent the websocket server
class Server {
	onMessage(string, conn) {
		// Send action to all other clients
		this.party.broadcast(event.data, [conn.id])
	}
}

