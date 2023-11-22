Triminion

This is for now a proof of concept, inspired by Dota, Warcraft Rumble, Totally Accurate Battle Simulator, et alia.

Latest version is at https://rumble.0sk.ar.

Basic ideas:

- two `Player`s
- player receives 1 `Gold` per second (max 10)
- player receives 4 random `Minion`s at start
- get a new (random) minion every 3 seconds
- player can deploy their minions to their own `Board`
- deployed minions move towards the opposite end of the Board
- minions will attempt to fight any enemy minion on the same `Y` value

## Dependencies

- https://gitlab.com/jfalxa/vroum
- https://webreflection.github.io/uhtml/

## Development

You need two local servers at the same time. Can also use `npm`.

```
bun install
bun run websocketserver
bun run dev
```

## Also see

- https://github.com/oskarrough/webhealer/
- https://github.com/oskarrough/slaytheweb/
