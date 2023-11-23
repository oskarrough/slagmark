Slagmark

A little game with two players.

For now a proof of concept, inspired by Dota, HOTS, Warcraft Rumble, Totally Accurate Battle Simulator, et alia. The idea is to have two (or more?) players deploy minions to a battlefield and let them fight. The strategy element is which type of minion to deploy when, and where. 

Latest version is at https://slagmark.0sk.ar. There will be bugs.

Basic concepts:

- two `Player`s
- player receives 1 `Gold` per second (max 10)
- player receives 4 random `Minion`s at start
- player receives 1 (random) minion every 3 seconds (max 4)
- player can deploy minions
- deployed minions move towards the opposite end of the Board
- deployed minions will attempt to fight any enemy minion on the same `Y` value

## Dependencies

- https://gitlab.com/jfalxa/vroum (for game logic and realtime)
- https://webreflection.github.io/uhtml/ (for rendering)
- https://www.partykit.io/ (for websocket communication)

## Development

```
bun install
bun run dev
```

## Also see

- https://github.com/oskarrough/webhealer/
- https://github.com/oskarrough/slaytheweb/
