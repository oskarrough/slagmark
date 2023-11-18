// Takes this giant list of vocabularies...
const words = await Bun.file(import.meta.dir + '/words.json').json()

// and creates a smaller list of words that are less than X characters long
const smallerWords = {}
for (const key of Object.keys(words)) {
	const vocab = words[key].filter((word) => word.length < 7)
	console.log(key, words[key].length, vocab.length, (vocab.length / words[key].length) * 100 + '%')
	smallerWords[key] = vocab
}

//and writes it to a file
await Bun.write(import.meta.dir + '/words-smaller.json', JSON.stringify(smallerWords, null, 2))
