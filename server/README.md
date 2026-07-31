# Multiplayer presence relay

A Cloudflare Worker backing the walking-character presence on the portfolio site.
Everything else on the site is static; this is the only part that needs a server.

One Durable Object (`PortfolioRoom`, named `global`) is the room. It relays position
snapshots between connected browsers and hands out a display name and a colour. It
holds no durable state - if it restarts, everyone reconnects and carries on.

## Running it locally

```
cd server
npm install
npm run dev          # ws://localhost:8787/ws
```

Then serve the site itself from the repository root and point the client at the local
worker by editing `NET_CONFIG.url` in `js/net.js`:

```
python3 -m http.server 8000
```

## Deploying

```
cd server
npx wrangler deploy
```

It is already deployed at:

```
wss://portfolio-multiplayer.portfolio-multiplayer.workers.dev/ws
```

which is what `NET_CONFIG.url` in `js/net.js` points at. Redeploying overwrites that
same worker and the address does not change. The site itself deploys exactly as it did
before - the worker is a separate, independent deploy, and a `wss://` connection is
allowed from the `http://` site (it is not mixed content).

The doubled name is because the account's workers.dev subdomain was registered as
`portfolio-multiplayer` on the first deploy, so the address is
`<worker>.<account-subdomain>.workers.dev`. Renaming the subdomain in the Cloudflare
dashboard changes the hostname, and `NET_CONFIG.url` has to be updated to match.

The migration in `wrangler.toml` uses `new_sqlite_classes`, which is what makes the
Durable Object eligible for the Workers free plan.

## Protocol

| Direction | Message |
| --- | --- |
| server -> client, on connect | `{t:"welcome", id, name, hue, peers:[{id,name,hue,x,y,dir,moving,loc}]}` |
| client -> server, ~10Hz | `{t:"state", x, y, dir, moving, loc}` |
| server -> client | `{t:"state", id, x, y, dir, moving, loc}` |
| server -> client | `{t:"join", id, name, hue}` / `{t:"leave", id}` |

`dir` is one of `Up`/`Down`/`Left`/`Right`/`None` and `moving` is a boolean, so each
client runs the walk cycle locally instead of the server shipping frame numbers.
`loc` is the scene (0 town, 1 warehouse, 2 library); clients only draw peers whose
scene matches their own.

Limits: 32 players in the room (further connections are closed with code 4001), and
20 messages per second per socket before a client's traffic is ignored.

A browser that closes cleanly is announced as gone immediately. One that vanishes -
lid shut, signal lost, process killed - never sends a close frame, so an alarm sweeps
the room every 10s and evicts anything silent for 30s, closing it with code 4002.
That code is retryable, so a client that is somehow still alive reconnects and is
announced again. The client's 2s keepalive is what the sweep measures.
