# Multiplayer presence - handover notes

Written to hand this work over to a future session. It covers what was built, how it
is deployed, what has and has not been verified, and what is left.

## What it does

Two people on the site at the same time see each other's character walking around the
same world, each labelled `Visitor N` and tinted a different colour. Presence only -
no chat, no interaction. People are only drawn when they are in the same scene, so
somebody in the library does not appear standing in the middle of the town.

## Architecture

The site is static files with no backend, so the multiplayer half needed a server.
It is a Cloudflare Worker in `server/`, deployed separately from the site itself.

```
browser A  --wss-->  Cloudflare Worker  <--wss--  browser B
                     (one Durable Object = one room)
```

The Durable Object is a relay and a roster and nothing else. It never simulates
movement, never decides where anyone is, and trusts a client only for that client's
own position. It hands out a display name and a colour, passes snapshots along, and
tells everyone when somebody joins or leaves.

Clients send their own position at 10Hz and draw everybody else 150ms in the past,
interpolating between the two snapshots either side of that moment. That delay is
what makes a 25fps game loop look smooth over 10Hz updates. The walk cycle is
animated locally from a `moving` boolean rather than shipping frame numbers.

## Files

| File | What it is |
| --- | --- |
| `server/src/index.js` | The relay. `PortfolioRoom` Durable Object, WebSocket hibernation, identity assignment, rate limiting, stale-connection sweep. |
| `server/wrangler.toml` | Worker config. The migration uses `new_sqlite_classes` - that is what makes the Durable Object free-tier eligible. |
| `server/README.md` | Server-side detail: protocol table, limits, how to run and deploy. |
| `js/net.js` | The client. `NET_CONFIG`, sprite tinting, `RemotePlayer` (interpolation + animation + label), `NetClient` (connect, reconnect, send throttling, scene filtering). |
| `js/commonClasses.js` | Gained `SpriteFrame` and `createCharacterFrames()`, moved out of the `Player` constructor so local and remote characters share one description of the sprite sheet. |
| `js/portfolio.js` | Four small hooks: construct + connect in `init()`, `net.draw()` in `draw()`, `net.update()` in `update()`, and `SpriteFrame` removed. |
| `index.html` | One extra `<script>` tag, before `portfolio.js`. |

`RemotePlayer` is deliberately **not** a `Player`. It has no pathfinding, no
collision, no trigger firing and no say over the camera. It is told where it is and
only has to get there without looking jerky.

## Protocol

| Direction | Message |
| --- | --- |
| server to client, on connect | `{t:"welcome", id, name, hue, peers:[{id,name,hue,x,y,dir,moving,loc}]}` |
| client to server, ~10Hz | `{t:"state", x, y, dir, moving, loc}` |
| server to client | `{t:"state", id, x, y, dir, moving, loc}` |
| server to client | `{t:"join", id, name, hue}` / `{t:"leave", id}` |

`dir` is `Up`/`Down`/`Left`/`Right`/`None`, `loc` is the scene (0 town, 1 warehouse,
2 library). Close codes: `4001` room full (client gives up), `4002` stale (client
reconnects).

## Deployment

**Worker** - deployed to a Cloudflare free account at:

```
wss://portfolio-multiplayer.portfolio-multiplayer.workers.dev/ws
```

The doubled name is because the account's workers.dev subdomain was registered as
`portfolio-multiplayer` on the first deploy, giving
`<worker>.<account-subdomain>.workers.dev`. Renaming the subdomain in the dashboard
changes the hostname and `NET_CONFIG.url` in `js/net.js` has to match.

To redeploy:

```
cd server
npm install
npx wrangler login       # or set CLOUDFLARE_API_TOKEN
npx wrangler deploy
```

`npx wrangler whoami` confirms which account is being used.

**Site** - two places serve it:

- GitHub Pages at <https://richy321.github.io/InteractivePortfolio2D/>, automatically
  from `master`. No action needed on a push.
- InfinityFree at <http://www.rjfox.co.uk>, uploaded over FTP by hand. (It used to be
  Hostinger; the stale publish profile that said so has been deleted.)

Both talk to the same room, so visitors on one see visitors on the other.

## Configuration

Everything tunable is a named constant at the top of its file.

`js/net.js`:

| Constant | Default | Meaning |
| --- | --- | --- |
| `NET_CONFIG.url` | the wss address above | Empty string switches multiplayer off entirely. |
| `NET_CONFIG.enabled` | `true` | The other off switch. |
| `NET_SEND_INTERVAL_MS` | 100 | How often the local position goes on the wire. |
| `NET_KEEPALIVE_MS` | 2000 | Proof-of-life while standing still. The server's sweep measures this. |
| `NET_INTERPOLATION_DELAY_MS` | 150 | How far in the past peers are drawn. |
| `NET_SNAP_DISTANCE` | 120 | Beyond this, a peer is moved rather than slid. |

`server/src/index.js`: `MAX_PLAYERS` 32, `MAX_MESSAGES_PER_SECOND` 20,
`STALE_TIMEOUT_MS` 30000, `SWEEP_INTERVAL_MS` 10000.

## Two decisions worth knowing about

**Failure is silent by design.** This is a live portfolio, so nothing about
multiplayer is allowed to break it. An unreachable relay, a full room, a browser
without WebSocket, or a blank `NET_CONFIG.url` all degrade to exactly the
single-player site. Every network entry point is feature-detected and try/caught, and
nothing in the update or draw path waits on a network reply. Keep it that way.

**Ghost eviction.** A browser that closes cleanly is announced as gone immediately.
One that vanishes - lid shut, signal lost, process killed - never sends a close frame,
and its character used to stand in the world until the edge tore the connection down,
which can take minutes. An alarm now sweeps every 10s and evicts anything silent for
30s. It is an alarm rather than a timer because alarms fire while the room is
hibernating, which is exactly the case that needed covering: a room full of ghosts is
a room where nobody is sending anything to wake it.

## Verification status

| What | How | Result |
| --- | --- | --- |
| Browser client, against a local worker | `server/test/browser.mjs` | 18/18 |
| Relay protocol, local and deployed | `server/test/protocol.mjs` | 11/11 |
| Ghost eviction, local and deployed | `server/test/stale.mjs` | 5/5 |
| Site intact after the ASP.NET cleanup | Page load + play | pass |

**The one untested link: a real browser against the live worker.** Every piece either
side of it is covered, but not that combination, because the environment this was
built in had no browser network access - its Chromium could not reach `example.com`,
let alone the worker. Confirming it takes one person opening the site in two windows.

Two environment quirks worth not rediscovering:

- The jQuery and Bootstrap CDNs were unreachable there, so every page load threw
  `jQuery is not defined`. Pristine `master` throws the identical set - it is the
  network, not the code.
- InfinityFree serves an anti-bot challenge (a 503 carrying JavaScript that sets a
  `__test` cookie and reloads). Browsers pass it invisibly; `curl` cannot see past it,
  so the live InfinityFree copy cannot be checked from a script.

The suites live in `server/test/` - see the README there. Three of them: the relay's
protocol, the browser client, and ghost eviction. The protocol and eviction suites
take a relay URL, so they run against the deployed worker unchanged.

## Outstanding

- **Rotate the Cloudflare API token.** One was pasted into a chat to do the first
  deploy. It never touched a file or a commit, but it is in that transcript.
- **Confirm `https://www.rjfox.co.uk`.** Plain HTTP serves the site; HTTPS did not
  respond when checked, though that check was inconclusive from a restricted network.
  If InfinityFree has no certificate installed, that is worth fixing on its own merits.
  It does not affect multiplayer either way - `wss://` works from an `http://` page.
- **Any future change to `js/net.js` needs re-uploading to InfinityFree by hand.**
  GitHub Pages updates itself; InfinityFree does not.

## Possible next steps

None of these are needed; they are the obvious directions if the feature grows.

- **Lock the relay to known origins.** It currently accepts a WebSocket from anywhere.
  Fine for presence, worth revisiting before anything is added that carries user text.
- **Let visitors choose a name**, stored in `localStorage`. Note this puts arbitrary
  text above a character on a portfolio site.
- **Chat or emotes.** The protocol has room for it, but it adds a moderation surface.
- **Interpolate remote characters through the walk animation more cheaply** by
  deriving `moving` from interpolated velocity instead of a wire flag, if bandwidth
  ever matters. It does not currently.
- **Cover the browser-against-deployed-relay path**, which no suite can reach.

## Commit history

| Commit | What |
| --- | --- |
| `1db0069` | The feature: worker, client, integration, shared sprite frames. |
| `27f9181` | Point `NET_CONFIG.url` at the deployed relay. |
| `c8e0286` | Ghost eviction sweep. |
| `45cd24c` | Merge into `master`. |
| `73cebd8` | Delete the stale publish profile. |
| `20e2997` | Delete the remaining ASP.NET scaffolding. |
