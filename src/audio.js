
window.slagmarkVolume = 0.1

/**
 * Plays a beep sound.
 * Inserts a <audio> elements, plays the sound, removes the element again.
 * @arg {string|number} n
 * @arg {number} [volume] - between 0 and 1, defaults to globalVolume
 * Available beeps:
		 26 blib (skating on ice)
		 27 ok? bluuueb
		 28 "nop"
		 29 error
		 30 flimsy light, confirmed */
export function beep(n, volume) {
	if (!n) return
	const audio = document.createElement('audio')
	audio.autoplay = true
	audio.volume = volume || window.slagmarkVolume
	document.body.appendChild(audio)
	audio.src = `./sfx/cute-bleeps-${n}.wav`
	audio.addEventListener('ended', audio.remove)
}
