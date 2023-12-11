// The volume is stored in this global variable.
window.slagmark = Object.assign(window.slagmark || {}, {volume: 0})

/**
 * Plays a beep sound
 * It inserts an <audio> elements to the DOM, plays the sound, removes it again.
 * Available beeps:
		 26 blib (skating on ice)
		 27 ok? bluuueb
		 28 "nop"
		 29 error
		 30 flimsy light, confirmed
 * @param {string} file - the filename path (exluding folder) 
 * @param {number} [volume] - between 0 and 1, defaults to globalVolume
 */
export function beep(file, volume) {
	if (!file) return
	const audio = document.createElement('audio')
	audio.autoplay = true
	audio.volume = volume || window.slagmark.volume
	document.body.appendChild(audio)
	audio.src = `./sfx/${file}`
	audio.addEventListener('ended', audio.remove)
}
