# Slagmark

A little game with two players for the web.

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

## Architecture & dependencies

This is a realtime, multiplayer game made for the web. Where possible, and if not too cumbersome, we use the platform.

Inside `src` you'll find the frontend. It's using [vroum](https://gitlab.com/jfalxa/vroum) + actions for game logic. Everything is organised into a tree of scheduable tasks and nodes. I can recommend it. For rendering we do web components + [uhtml](https://webreflection.github.io/uhtml/).

For the multiplayer we use websockets. Inside `server` we have a couple of Cloudflare workers made with [partykit](https://www.partykit.io/).

## Development

```
bun install
bun run dev
```

## Deployment

- `bun run deploy:backend` (required any time server/* files are changed)
- the `main` branch deploys to https://slagmark.0sk.ar via Cloudflare pages (Oskar's account)

## Also see

- https://github.com/oskarrough/webhealer/
- https://github.com/oskarrough/slaytheweb/
