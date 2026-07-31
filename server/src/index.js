// Realtime presence relay for the InteractivePortfolio2D site.
//
// One Durable Object instance ("global") is the single room. It is a relay and a
// roster, nothing more: it never simulates movement and never trusts a client for
// anything but its own position. All per-connection state lives in the socket's
// attachment rather than in instance memory, so the room can hibernate between
// messages and wake up knowing who everyone is.

const MAX_PLAYERS = 32;

// Room is full. 4000-4999 is the range applications are allowed to use, and the
// client treats this one as "give up quietly" rather than "retry".
const CLOSE_ROOM_FULL = 4001;

// Nothing heard from the socket for too long. Unlike the room being full this is
// worth retrying, so the client reconnects normally when it sees it.
const CLOSE_STALE = 4002;

// A browser that goes away cleanly closes its socket and the room hears about it
// immediately. One that vanishes - lid shut, signal lost, process killed - never
// sends a close frame, and without this its character would stand in the world as a
// ghost until the edge eventually tears the connection down. The client already
// sends a keepalive every 2s, so silence for this long means it is gone.
const STALE_TIMEOUT_MS = 30000;
const SWEEP_INTERVAL_MS = 10000;

// Messages per second a single socket is allowed before it is ignored. The client
// sends at 10Hz, so this is generous enough to never trip on a real browser.
const MAX_MESSAGES_PER_SECOND = 20;

const DIRECTIONS = ["Up", "Down", "Left", "Right", "None"];
const MAX_LOCATION = 2; // LocationEnum: TOWN, WAREHOUSE, LIBRARY

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return new Response(JSON.stringify({ ok: true }), {
				headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
			});
		}

		if (url.pathname !== "/ws")
			return new Response("Not found", { status: 404 });

		if (request.headers.get("Upgrade") !== "websocket")
			return new Response("Expected a websocket upgrade", { status: 426 });

		// A single named object, so every visitor lands in the same room.
		const id = env.ROOM.idFromName("global");
		return env.ROOM.get(id).fetch(request);
	},
};

export class PortfolioRoom {
	constructor(state, env) {
		this.state = state;
		this.env = env;
	}

	async fetch(request) {
		const sockets = this.state.getWebSockets();
		const pair = new WebSocketPair();
		const client = pair[0];
		const server = pair[1];

		if (sockets.length >= MAX_PLAYERS) {
			server.accept();
			server.close(CLOSE_ROOM_FULL, "Room full");
			return new Response(null, { status: 101, webSocket: client });
		}

		// Hibernation: the runtime holds the socket for us and calls the handlers
		// below, so an idle room costs nothing.
		this.state.acceptWebSocket(server);

		const visitorNo = lowestFreeVisitorNumber(sockets);
		const identity = {
			id: crypto.randomUUID(),
			name: "Visitor " + visitorNo,
			hue: hueForVisitor(visitorNo),
		};

		server.serializeAttachment({
			id: identity.id,
			name: identity.name,
			hue: identity.hue,
			state: null,
			windowStart: 0,
			windowCount: 0,
			lastSeen: Date.now(),
		});

		await this.ensureSweepScheduled();

		const peers = [];
		for (const other of sockets) {
			const attachment = readAttachment(other);
			if (attachment && attachment.state) {
				peers.push({
					id: attachment.id,
					name: attachment.name,
					hue: attachment.hue,
					...attachment.state,
				});
			}
		}

		send(server, { t: "welcome", id: identity.id, name: identity.name, hue: identity.hue, peers });
		this.broadcast({ t: "join", id: identity.id, name: identity.name, hue: identity.hue }, server);

		return new Response(null, { status: 101, webSocket: client });
	}

	webSocketMessage(ws, raw) {
		const attachment = readAttachment(ws);
		if (!attachment)
			return;

		// Any message at all counts as proof of life, including one that turns out to
		// be malformed or rate limited - the point is that something is still there.
		const now = Date.now();
		attachment.lastSeen = now;

		// Fixed one-second window. Cheap, and it only has to stop a runaway client
		// from fanning its traffic out to everyone else in the room.
		if (now - attachment.windowStart >= 1000) {
			attachment.windowStart = now;
			attachment.windowCount = 0;
		}
		attachment.windowCount++;
		if (attachment.windowCount > MAX_MESSAGES_PER_SECOND) {
			ws.serializeAttachment(attachment);
			return;
		}

		let message;
		try {
			message = JSON.parse(raw);
		} catch (err) {
			ws.serializeAttachment(attachment);
			return;
		}

		if (!message || message.t !== "state") {
			ws.serializeAttachment(attachment);
			return;
		}

		const playerState = sanitiseState(message);
		if (!playerState) {
			ws.serializeAttachment(attachment);
			return;
		}

		attachment.state = playerState;
		ws.serializeAttachment(attachment);

		this.broadcast({ t: "state", id: attachment.id, ...playerState }, ws);
	}

	webSocketClose(ws) {
		this.announceLeave(ws);
	}

	webSocketError(ws) {
		this.announceLeave(ws);
	}

	announceLeave(ws) {
		const attachment = readAttachment(ws);
		if (attachment)
			this.broadcast({ t: "leave", id: attachment.id }, ws);
	}

	// Evicts anyone who stopped talking. Runs off an alarm rather than a timer so it
	// still fires while the room is hibernating, which is the whole point - a room
	// full of ghosts is exactly the case where nobody is sending anything to wake it.
	async alarm() {
		const now = Date.now();

		for (const socket of this.state.getWebSockets()) {
			const attachment = readAttachment(socket);
			if (!attachment)
				continue;

			if (now - attachment.lastSeen <= STALE_TIMEOUT_MS)
				continue;

			// Announced before closing rather than relying on webSocketClose, which is
			// for the client hanging up: this end is the one hanging up here. A client
			// that is somehow still alive will reconnect and be announced again.
			this.broadcast({ t: "leave", id: attachment.id }, socket);

			try {
				socket.close(CLOSE_STALE, "No keepalive");
			} catch (err) {
				// Already gone, which is the outcome we wanted anyway.
			}
		}

		// Only keep sweeping while there is somebody to sweep, so an empty room costs
		// nothing at all.
		if (this.state.getWebSockets().length > 0)
			await this.state.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
	}

	async ensureSweepScheduled() {
		const existing = await this.state.storage.getAlarm();

		if (existing == null)
			await this.state.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
	}

	broadcast(message, except) {
		const payload = JSON.stringify(message);

		for (const socket of this.state.getWebSockets()) {
			if (socket === except)
				continue;

			try {
				socket.send(payload);
			} catch (err) {
				// Socket is on its way out; the close handler will tidy up.
			}
		}
	}
}

function readAttachment(ws) {
	try {
		return ws.deserializeAttachment();
	} catch (err) {
		return null;
	}
}

function send(ws, message) {
	try {
		ws.send(JSON.stringify(message));
	} catch (err) {
		// Nothing useful to do if the socket died between accept and first send.
	}
}

// Reuses numbers freed by people who have left, so a room of three is always
// Visitor 1..3 rather than Visitor 1, 47, 112.
function lowestFreeVisitorNumber(sockets) {
	const taken = new Set();

	for (const socket of sockets) {
		const attachment = readAttachment(socket);
		if (!attachment)
			continue;

		const parsed = parseInt(String(attachment.name).replace("Visitor ", ""), 10);
		if (!isNaN(parsed))
			taken.add(parsed);
	}

	let candidate = 1;
	while (taken.has(candidate))
		candidate++;

	return candidate;
}

// Golden-angle spacing: consecutive visitors get colours that are far apart, and
// none of them land near the untinted sprite the local player sees as itself.
function hueForVisitor(visitorNo) {
	return Math.round((visitorNo * 137.508) % 360);
}

function sanitiseState(message) {
	const x = Number(message.x);
	const y = Number(message.y);

	if (!isFinite(x) || !isFinite(y))
		return null;

	const loc = Math.round(Number(message.loc));

	return {
		// The world is 1024x768 but interiors are placed at world offsets, so the
		// clamp is only here to bound what can be relayed, not to enforce the map.
		x: clamp(x, -10000, 10000),
		y: clamp(y, -10000, 10000),
		dir: DIRECTIONS.indexOf(message.dir) === -1 ? "None" : message.dir,
		moving: message.moving === true,
		loc: isFinite(loc) ? clamp(loc, 0, MAX_LOCATION) : 0,
	};
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
