export const actions = {
	// createGame() {
	// 	return {}
	// },
	deployMinion(game, action) {
		console.log('deployMinion action')
		const minion = game.Minions.find(m => m.id === action.id)
		console.log(action, minion)
		minion?.deploy()
	}
}

// export const actions = {
// 	createGame() {
// 		return {type: 'CREATE_GAME'}
// 	},
// 	deployMinion(id) {
// 		return {type: 'DEPLOY_MINION', id}
// 	}
// }

