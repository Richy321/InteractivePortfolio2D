// Ghost eviction. A browser that vanishes without closing its socket - lid shut,
// signal lost, process killed - must not leave its character standing in the world.
//
//   node stale.mjs [relay-url]
//
// Takes about 50 seconds: it has to outlast STALE_TIMEOUT_MS, which is 30s.
//
// A silent-but-open socket is the right stand-in for that case. Destroying the
// socket instead would not test this at all - the TCP reset reaches the server and
// the ordinary close path handles it immediately, which is the case that already
// worked.

import WebSocket from 'ws';
import { check, summarise, wait, wsOptions, RELAY_URL } from './harness.mjs';

const CLOSE_STALE = 4002;
const opts = await wsOptions(RELAY_URL);
console.log('target: ' + RELAY_URL + '   (this suite takes ~50s)');

function connect(label) {
	const ws = new WebSocket(RELAY_URL, opts);
	ws.inbox = [];
	ws.closed = null;
	ws.on('message', d => ws.inbox.push(JSON.parse(d.toString())));
	ws.on('close', (code, reason) => { ws.closed = { code, reason: reason.toString() }; });

	return new Promise((resolve, reject) => {
		ws.once('open', () => resolve(ws));
		ws.once('error', reject);
		setTimeout(() => reject(new Error(label + ' connect timeout')), 20000);
	});
}

const sendState = (ws, x) => ws.send(JSON.stringify({ t: 'state', x, y: 300, dir: 'Down', moving: false, loc: 0 }));

// A behaves like a real browser and keepalives every 2s. B says nothing at all.
const A = await connect('A');
const B = await connect('B');
await wait(1000);
sendState(A, 100);
sendState(B, 200);
await wait(1000);

const idB = A.inbox.find(m => m.t === 'join')?.id ?? B.inbox.find(m => m.t === 'welcome')?.id;
const idA = B.inbox.find(m => m.t === 'join')?.id ?? A.inbox.find(m => m.t === 'welcome')?.id;
A.inbox.length = 0;
B.inbox.length = 0;

const started = Date.now();
let evictedAt = null;

for (let i = 0; i < 23; i++) {
	await wait(2000);
	sendState(A, 100 + i);

	if (!evictedAt && A.inbox.some(m => m.t === 'leave' && m.id === idB))
		evictedAt = Date.now() - started;
}

check('silent client is evicted', evictedAt !== null,
	evictedAt !== null ? `leave broadcast after ${(evictedAt / 1000).toFixed(0)}s of silence` : 'never evicted in 46s');
// The window is the 30s timeout plus up to one 10s sweep, so anything much outside
// 30-45s means the sweep is not running on the cadence it should be.
check('eviction lands in the expected window rather than instantly or never',
	evictedAt !== null && evictedAt >= 28000 && evictedAt <= 46000, `${evictedAt}ms`);
check('evicted socket is closed with the retryable stale code',
	B.closed !== null && B.closed.code === CLOSE_STALE, JSON.stringify(B.closed));
check('the client that kept talking was NOT evicted',
	A.closed === null && A.readyState === 1 && !B.inbox.some(m => m.t === 'leave' && m.id === idA),
	`A open=${A.readyState === 1}`);

// Eviction is not a ban: whoever was dropped can come back.
const C = await connect('C');
await wait(1500);
sendState(C, 400);
await wait(1500);
check('a fresh connection is announced normally after a sweep',
	A.inbox.some(m => m.t === 'join'),
	JSON.stringify(A.inbox.filter(m => m.t === 'join').map(m => m.name)));

A.close();
C.close();
summarise();
