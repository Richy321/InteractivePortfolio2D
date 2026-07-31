// The relay's own behaviour, driven by plain WebSocket clients. No browser, so this
// one runs against a deployed worker as happily as a local one:
//
//   node protocol.mjs                                             # local wrangler dev
//   node protocol.mjs wss://<worker>.workers.dev/ws                # deployed

import WebSocket from 'ws';
import { check, summarise, wait, wsOptions, RELAY_URL } from './harness.mjs';

const opts = await wsOptions(RELAY_URL);
console.log('target: ' + RELAY_URL);

function connect(label) {
	const ws = new WebSocket(RELAY_URL, opts);
	ws.inbox = [];
	ws.on('message', d => ws.inbox.push(JSON.parse(d.toString())));

	return new Promise((resolve, reject) => {
		ws.once('open', () => resolve(ws));
		ws.once('error', reject);
		setTimeout(() => reject(new Error(label + ' connect timeout')), 20000);
	});
}

const first = (ws, t) => ws.inbox.find(m => m.t === t);
const all = (ws, t) => ws.inbox.filter(m => m.t === t);

const A = await connect('A');
await wait(1500);
const welcomeA = first(A, 'welcome');

check('connects to the relay', A.readyState === 1);
check('server assigns an identity',
	!!welcomeA && !!welcomeA.id && !!welcomeA.name && welcomeA.hue !== undefined,
	JSON.stringify(welcomeA && { name: welcomeA.name, hue: welcomeA.hue, peers: welcomeA.peers.length }));

const B = await connect('B');
await wait(1500);
const welcomeB = first(B, 'welcome');

check('second client gets its own distinct identity',
	welcomeB.id !== welcomeA.id && welcomeB.name !== welcomeA.name && welcomeB.hue !== welcomeA.hue,
	`${welcomeA.name}/${welcomeA.hue} vs ${welcomeB.name}/${welcomeB.hue}`);
check('existing client is told about the join',
	!!first(A, 'join') && first(A, 'join').id === welcomeB.id, JSON.stringify(first(A, 'join')));

B.inbox.length = 0;
A.send(JSON.stringify({ t: 'state', x: 500, y: 300, dir: 'Right', moving: true, loc: 0 }));
await wait(1200);
const relayed = first(B, 'state');

check('position snapshots relay to the other client',
	!!relayed && relayed.id === welcomeA.id && relayed.x === 500 && relayed.y === 300 &&
	relayed.dir === 'Right' && relayed.moving === true, JSON.stringify(relayed));

// Everyone already knows where they are; echoing it back would be pure noise, and
// on the client it would fight with the local position.
A.inbox.length = 0;
A.send(JSON.stringify({ t: 'state', x: 501, y: 301, dir: 'Right', moving: true, loc: 0 }));
await wait(1000);
check('sender does not get an echo of its own state', all(A, 'state').length === 0,
	`${all(A, 'state').length} echoes`);

// Someone arriving late must see people who are already standing around, not wait
// for each of them to move first.
const C = await connect('C');
await wait(1500);
const welcomeC = first(C, 'welcome');
check('late joiner receives existing players in its welcome',
	welcomeC.peers.filter(p => p.x !== undefined).length >= 1,
	JSON.stringify(welcomeC.peers.map(p => p.name + '@' + p.x + ',' + p.y)));

B.inbox.length = 0;
A.send('not json at all');
A.send(JSON.stringify({ t: 'state', x: 'abc', y: null, dir: 'Sideways', loc: 99 }));
A.send(JSON.stringify({ t: 'nonsense' }));
await wait(1200);
check('malformed input is dropped without killing the socket',
	A.readyState === 1 && all(B, 'state').length === 0,
	`A open=${A.readyState === 1}, relayed=${all(B, 'state').length}`);

B.inbox.length = 0;
A.send(JSON.stringify({ t: 'state', x: 999999, y: -999999, dir: 'Up', moving: false, loc: 7 }));
await wait(1200);
const clamped = first(B, 'state');
check('out-of-range values are clamped by the server',
	!!clamped && clamped.x === 10000 && clamped.y === -10000 && clamped.loc === 2,
	JSON.stringify(clamped));

B.inbox.length = 0;
C.close();
await wait(1500);
check('disconnect broadcasts a leave',
	!!first(B, 'leave') && first(B, 'leave').id === welcomeC.id, JSON.stringify(first(B, 'leave')));

check('both remaining sockets still open', A.readyState === 1 && B.readyState === 1);

A.close();
B.close();
summarise();
