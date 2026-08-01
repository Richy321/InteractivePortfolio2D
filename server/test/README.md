# Tests

Three suites. None of them mock anything: they drive real browsers and real
WebSocket connections, because the things worth checking here - interpolation,
animation timing, what actually reaches the canvas, when a dead connection is
noticed - do not survive being mocked.

```
cd server/test
npm install
npx playwright install chromium    # only needed for the browser suite
```

## Running them

Two things have to be up first:

```
cd server && npx wrangler dev          # relay on ws://localhost:8787/ws
python3 -m http.server 8000            # site, from the repository root
```

Then:

| Command | What it covers | Time |
| --- | --- | --- |
| `npm run test:protocol` | The relay: identity, join/leave, relaying, validation, clamping | ~10s |
| `npm run test:browser` | The client: two browsers seeing each other, movement, animation, scene filtering, rendering, failure modes | ~30s |
| `npm run test:stale` | Ghost eviction. Has to outlast the 30s timeout | ~50s |
| `npm test` | All three | ~90s |

Each prints `PASS`/`FAIL` per check and exits non-zero if any failed.

## Against the deployed worker

The protocol and stale suites take a relay URL, so they run against production
unchanged:

```
node protocol.mjs wss://portfolio-multiplayer.portfolio-multiplayer.workers.dev/ws
node stale.mjs    wss://portfolio-multiplayer.portfolio-multiplayer.workers.dev/ws
```

The browser suite cannot: it passes the relay to the page as `?mp=`, which
`js/net.js` honours only on localhost, so a deployed *site* always uses its own
configured relay. Testing a deployed site against a deployed relay means opening it
in two windows and looking - which is worth doing anyway, and is the one path none
of this covers.

## Environment

| Variable | Default | Why |
| --- | --- | --- |
| `RELAY_URL` | `ws://localhost:8787/ws` | Also settable as the first argument. |
| `SITE_URL` | `http://localhost:8000/index.html` | Where the site is served. |
| `PW_CHROMIUM` | Playwright's own | Path to a browser, where one is already installed. |
| `SCREENSHOT_DIR` | none | Set it to save screenshots from the browser suite. |
| `HTTPS_PROXY` | none | Honoured for `wss://` if `https-proxy-agent` is installed. |

## Notes

- The site loads Bootstrap's CSS and JS from a CDN. Somewhere without access to it the
  navbar's collapse and dropdown will not work, though nothing throws - the page has no
  other third-party script, and the game does not depend on Bootstrap at all.
- The walk-cycle check samples across a long walk on purpose. Sampling after a short
  hop is flaky: the walk can finish before the first sample and every frame reads 0.
- `stale.mjs` simulates a vanished client with a socket that stays open and says
  nothing. Destroying the socket would not test the sweep at all - the reset reaches
  the server and the ordinary close path handles it immediately.
