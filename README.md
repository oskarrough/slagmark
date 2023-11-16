Web Rumble

This is for now a proof of concept, inspired by Warcraft Rumble et alia.

Basic ideas:

- two `Player`s
- player receives 1 `Gold` per second (max 10)
- player receives 4 random `Minion`s at start
- player can deploy own minions to a `Board`
- deployed minions move towards the opposite end of the Board
- minions will attempt to fight any enemy minion on the same `Y` value

## Dependencies

- https://gitlab.com/jfalxa/vroum
- https://webreflection.github.io/uhtml/

## Development

```
bunx partykit dev
bun run dev
```

## Also see

- https://github.com/oskarrough/webhealer/
- https://github.com/oskarrough/slaytheweb/
