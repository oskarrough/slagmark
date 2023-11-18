/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */
/** @typedef {import("partykit/server").Party} Party */

let ROOMS = []

/**
 * @implements {Server}
 */
export default class PartyServer {
	constructor(party) {
		this.party = party
	}

	// async onStart() {
	// 	ROOMS = (await this.party.storage.get('rooms')) ?? []
	// 	// await this.party.storage.delete('rooms')
	// 	// ROOMS = []
	// 	// const lobbyRoom = await this.addRoom('lobby')
	// 	console.log('lobby server:start', this.party.id, ROOMS)
	// }

	onConnect(conn, ctx) {
		console.log('lobby server:connect', this.party.id, new URL(ctx.request.url).pathname)
		// const msg = {type: 'info', message: `${conn.id} joined game ${this.party.id}`}
		// this.party.broadcast(JSON.stringify(msg))
		// this.updatePresence()
		this.updateConnections('connect', conn)
		// if (this.party.id !== 'lobby') {}
	}

	async onMessage(websocketMessage, sender) {
		const event = JSON.parse(websocketMessage)
		console.log('lobby server:message', this.party.id, event)
		if (event.type === 'create') {
			await this.addRoom()
			// this.updatePresence()
		}
		// if (event.type === 'update') {
		// 	const item = (await this.party.storage.get(`room:${event.id}`)) ?? {}
		// 	const updatedItem = {
		// 		...item,
		// 		...event.data,
		// 	}
		// 	await this.party.storage.put(`item:${event.id}`, updatedItem)
		// }
	}

	onClose(conn) {
		console.log('lobby server:close')
		// const msg = {type: 'leave', connId: conn.id, roomId: this.party.id}
		// this.party.broadcast(JSON.stringify(msg))
		// this.updatePresence()
		this.updateConnections('disconnect', conn)
	}

	async updateConnections(type, connection) {
		const connectionsRoom = this.party.context.parties.whatever.get('active-connections')
		await connectionsRoom.fetch({
			method: 'POST',
			body: JSON.stringify({type, connectionId: connection.id, roomId: this.party.id}),
		})
	}

	// async updatePresence() {
	// 	const count = Array.from(this.party.getConnections()).length
	// 	console.log('lobby server:presence', this.party.id, count)
	// 	const room = ROOMS.find((room) => room.id === this.party.id)
	// 	if (room) {
	// 		room.count = count
	// 		console.log('updated presence', room)
	// 	} else if (this.party.id !== 'lobby') {
	// 		console.log('WARN no room for presence', this.party.id)
	// 		console.log(this.party.context.parties)
	// 		// console.log(ROOMS)
	// 		// console.log((await this.party.storage.get('rooms')))
	// 	}
	// 	const msg = {type: 'presence', room, rooms: ROOMS}
	// 	this.party.broadcast(JSON.stringify(msg))
	// 	await this.party.storage.put('rooms', ROOMS)
	// }

	async addRoom(id) {
		if (ROOMS.find((room) => room.id === id)) {
			console.log('room already exists', id)
			return
		}
		if (!id) id = crypto.randomUUID()
		const room = {id, created: Date.now(), count: 0}
		ROOMS = [...ROOMS, room]
		await this.party.storage.put('rooms', ROOMS)
		console.log('lobby server added room', room)
		return room
	}

	getRooms() {}
}
