/** @typedef {import("partykit/server").Server} Server */
/** @typedef {import("partykit/server").Connection} Connection */
/** @typedef {import("partykit/server").ConnectionContext} ConnectionContext */
/** @typedef {import("partykit/server").Party} Party */

/**
 * @implements {Server}
 */
export default class PartyServer {
	constructor(party) {
		this.party = party
		this.rooms = []
	}

	async onStart() {
		// await this.party.storage.delete('rooms')
		this.rooms = (await this.party.storage.get('rooms')) ?? []
		
		// const lobbyRoom = await this.addRoom('lobby')
		
		console.log('lobby server:start', this.party.id, this.rooms)
	}

	onConnect(conn, ctx) {
		console.log('lobby server:connectt', this.party.id, new URL(ctx.request.url).pathname)

		const msg = {type: 'info', message: `${conn.id} joined ${this.party.id}`}
		this.party.broadcast(JSON.stringify(msg))

		this.updatePresence()

		if (this.party.id !== 'lobby') {
		}
	}

	async onMessage(websocketMessage, sender) {
		const event = JSON.parse(websocketMessage)
		console.log('lobby server:message', this.party.id, event)

		if (event.type === 'create') {
			await this.addRoom()
			this.updatePresence()
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
		console.log('sending leave to client')
		const msg = {type: 'leave', connId: conn.id, roomId: this.party.id}
		this.party.broadcast(JSON.stringify(msg))
		this.updatePresence()
	}

	async updatePresence() {
		const count = Array.from(this.party.getConnections()).length

		const room = this.rooms.find((room) => room.id === this.party.id)
		if (room) {
			console.log(`updated ${room.id} count`, count)
			room.count = count
		} else {
			console.log('how no room?', this.party.id)
		}

		console.log('updatePresence', this.party.id)
		const msg = {type: 'presence', room, rooms: this.rooms}
		this.party.broadcast(JSON.stringify(msg))

		await this.party.storage.put('rooms', this.rooms)
	}

	async addRoom(id) {
		if (this.rooms.find((room) => room.id === id)) {
			console.log('room already exists', id)
			return
		}
		if (!id) id = crypto.randomUUID()
		const room = {id, created: Date.now(), count: 0}
		this.rooms = [...this.rooms, room]
		await this.party.storage.put('rooms', this.rooms)
		console.log('lobby server added room', room)
		return room
	}
}

/*
client opens page
connects to lobby automatically

can see list of existing rooms
can create new room
can join room
can leave room

connect -> type:join -> rooms
msg -> join(id)
*/
