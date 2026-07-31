// Two real browsers on the site, against a relay. Covers the client half: what a
// visitor actually sees.
//
//   node browser.mjs [relay-url]
//
// Needs the site served over HTTP (see README) and a relay running. The relay is
// passed to the page as ?mp=, which js/net.js only honours on localhost - so this
// suite drives a locally served copy of the site, not a deployed one.

import { chromium } from 'playwright';
import { check, summarise, waitFor, launchOptions, isCdnError, SITE_URL, RELAY_URL, SCREENSHOT_DIR } from './harness.mjs';

const site = SITE_URL + '?mp=' + encodeURIComponent(RELAY_URL);
const viewport = { width: 900, height: 700 };
const shot = name => SCREENSHOT_DIR ? { path: SCREENSHOT_DIR + '/' + name } : null;

console.log('site: ' + site);

const browser = await chromium.launch(launchOptions());
const ctxA = await browser.newContext({ viewport });
const ctxB = await browser.newContext({ viewport });
const A = await ctxA.newPage();
const B = await ctxB.newPage();

const errorsA = [], errorsB = [];
A.on('pageerror', e => { if (!isCdnError(e)) errorsA.push(String(e)); });
B.on('pageerror', e => { if (!isCdnError(e)) errorsB.push(String(e)); });

await A.goto(site);
await B.goto(site);

// --- identity ---

const idA = await waitFor(A, () => (window.net && net.selfId) || null, 'A selfId');
const idB = await waitFor(B, () => (window.net && net.selfId) || null, 'B selfId');
check('both clients connect and receive an identity', !!idA && !!idB && idA !== idB,
	`A=${idA.slice(0, 8)} B=${idB.slice(0, 8)}`);

const peerList = () => {
	const list = Object.values(net.peers);
	return list.length ? list.map(p => ({ id: p.id, name: p.name, hue: p.hue, has: p.hasPosition })) : null;
};
const peersA = await waitFor(A, peerList, 'A peers');
const peersB = await waitFor(B, peerList, 'B peers');

check('each browser sees exactly one other player', peersA.length === 1 && peersB.length === 1,
	JSON.stringify({ A: peersA, B: peersB }));
check('peers get distinct names and hues',
	peersA[0].name !== peersB[0].name && peersA[0].hue !== peersB[0].hue,
	`${peersA[0].name}(hue ${peersA[0].hue}) vs ${peersB[0].name}(hue ${peersB[0].hue})`);
check('peer positions arrive', peersA[0].has === true && peersB[0].has === true);

// --- movement replicates ---

const beforeB = await B.evaluate(() => { const p = Object.values(net.peers)[0]; return { x: p.renderX, y: p.renderY }; });
const beforeA = await A.evaluate(() => ({ x: player.positionX, y: player.positionY }));

await A.mouse.click(700, 480); // click-to-move, so this exercises the A* path too
await A.waitForTimeout(1600);

const afterA = await A.evaluate(() => ({ x: player.positionX, y: player.positionY, dir: player.curDirection }));
const afterB = await B.evaluate(() => {
	const p = Object.values(net.peers)[0];
	return { x: p.renderX, y: p.renderY, dir: p.curDirection, snaps: p.snapshots.length };
});
const movedA = Math.hypot(afterA.x - beforeA.x, afterA.y - beforeA.y);
const movedB = Math.hypot(afterB.x - beforeB.x, afterB.y - beforeB.y);

check('local player actually moved in A', movedA > 20, `moved ${movedA.toFixed(1)}px`);
check('movement replicated into B', movedB > 20, `peer moved ${movedB.toFixed(1)}px, dir=${afterB.dir}`);
// Interpolation runs 150ms behind, so the two are never identical - only close.
check('replicated position tracks the source closely',
	Math.hypot(afterA.x - afterB.x, afterA.y - afterB.y) < 40,
	`A=(${afterA.x.toFixed(0)},${afterA.y.toFixed(0)}) B-view=(${afterB.x.toFixed(0)},${afterB.y.toFixed(0)})`);
check('B interpolates between buffered snapshots', afterB.snaps >= 1, `${afterB.snaps} snapshots buffered`);

// --- walk cycle ---
// Sampled across a long walk. Sampling after a short hop is flaky: the walk can
// finish before the first sample and the frames all read 0.

await A.mouse.click(700, 480);
await A.waitForTimeout(400);

const localFrames = new Set(), remoteFrames = new Set();
let movingSeen = false;

for (let i = 0; i < 12; i++) {
	const [local, remote] = await Promise.all([
		A.evaluate(() => player.curFrameNo),
		B.evaluate(() => { const p = Object.values(net.peers)[0]; return { f: p.curFrameNo, m: p.moving }; }),
	]);
	localFrames.add(local);
	remoteFrames.add(remote.f);
	movingSeen = movingSeen || remote.m;
	await A.waitForTimeout(150);
}

check('remote walk cycle animates while moving', remoteFrames.size > 1 && movingSeen,
	`remote frames: ${[...remoteFrames].join(',')}, moving seen: ${movingSeen}`);
check('remote walk cycle matches the frames the source is showing',
	[...remoteFrames].sort().join(',') === [...localFrames].sort().join(','),
	`local ${[...localFrames].sort().join(',')} vs remote ${[...remoteFrames].sort().join(',')}`);

// Halting is a change with no position delta behind it, so it needs its own send -
// otherwise the walk cycle runs on the spot until the next keepalive.
await A.waitForTimeout(800);
const idle = await B.evaluate(() => {
	const p = Object.values(net.peers)[0];
	return { frame: p.curFrameNo, moving: p.moving };
});
check('remote character stops animating within ~800ms of halting',
	idle.frame === 0 && idle.moving === false, JSON.stringify(idle));

if (shot('both-in-town.png')) await B.screenshot(shot('both-in-town.png'));

// --- scene filtering ---

await A.evaluate(() => { initLibrary(); locationState = LocationEnum.LIBRARY; });
await A.waitForTimeout(800);
const filtered = await B.evaluate(() => {
	const p = Object.values(net.peers)[0];
	return { peerLoc: p.loc, myLoc: locationState, drawn: p.loc === locationState };
});
check('peer in another scene is hidden', filtered.drawn === false && filtered.peerLoc === 2,
	JSON.stringify(filtered));

await A.evaluate(() => { initTown(); locationState = LocationEnum.TOWN; });
await A.waitForTimeout(800);
const back = await B.evaluate(() => {
	const p = Object.values(net.peers)[0];
	return { drawn: p.loc === locationState };
});
check('peer reappears on returning to the same scene', back.drawn === true, JSON.stringify(back));

// --- the peer is really drawn, not just tracked ---
// Samples the canvas where the peer should be, with it drawn and with it
// suppressed, so the pixels are known to come from this code and not the scenery.

const drawn = await B.evaluate(() => {
	const p = Object.values(net.peers)[0];
	const w = p.frameWidth * p.spriteScale, h = p.frameHeight * p.spriteScale;
	const x = Math.round(p.renderX + virtualCameraOffsetX), y = Math.round(p.renderY + virtualCameraOffsetY);

	if (x < 0 || y < 0 || x + w > canvas.width || y + h > canvas.height)
		return { skipped: 'peer off screen' };

	const sample = () => {
		const d = ctx.getImageData(x, y, w, h).data;
		let sum = 0;
		for (let i = 0; i < d.length; i++) sum += d[i];
		return sum;
	};

	const withPeer = sample();
	const saved = net.peers;
	net.peers = {};
	draw();
	const withoutPeer = sample();
	net.peers = saved;
	draw();

	return { withPeer, withoutPeer, differs: withPeer !== withoutPeer };
});
check('peer is actually rendered to the canvas', drawn.skipped ? true : drawn.differs === true,
	JSON.stringify(drawn));

// --- disconnect ---

await ctxA.close();
await B.waitForTimeout(1500);
const afterClose = await B.evaluate(() => Object.keys(net.peers).length);
check('closing a tab removes its character', afterClose === 0, `${afterClose} peers left`);

check('no uncaught errors in either page', errorsA.length === 0 && errorsB.length === 0,
	JSON.stringify({ A: errorsA, B: errorsB }));

// --- failure modes: the site must never depend on any of this working ---

const C = await (await browser.newContext({ viewport })).newPage();
const errorsC = [];
C.on('pageerror', e => { if (!isCdnError(e)) errorsC.push(String(e)); });
await C.goto(SITE_URL + '?mp=' + encodeURIComponent('ws://localhost:9/ws')); // nothing listens on 9
await C.waitForTimeout(2500);

const beforeC = await C.evaluate(() => ({ x: player.positionX, y: player.positionY }));
await C.mouse.click(650, 460);
await C.waitForTimeout(1500);
const afterC = await C.evaluate(() => ({ x: player.positionX, y: player.positionY }));
const movedC = Math.hypot(afterC.x - beforeC.x, afterC.y - beforeC.y);

check('game still playable with an unreachable relay', movedC > 20 && errorsC.length === 0,
	`moved ${movedC.toFixed(1)}px, errors=${JSON.stringify(errorsC)}`);

const D = await (await browser.newContext({ viewport })).newPage();
const errorsD = [];
D.on('pageerror', e => { if (!isCdnError(e)) errorsD.push(String(e)); });
await D.goto(SITE_URL);
await D.waitForTimeout(1200);

const off = await D.evaluate(() => {
	const savedUrl = NET_CONFIG.url;

	NET_CONFIG.url = '';
	const blank = new NetClient();
	blank.connect();
	const noUrl = blank.socket === null;

	NET_CONFIG.url = savedUrl;
	NET_CONFIG.enabled = false;
	const disabledClient = new NetClient();
	disabledClient.connect();
	const disabled = disabledClient.socket === null;

	NET_CONFIG.enabled = true;
	return { noUrl, disabled };
});
check('blank url and enabled:false both prevent any connection',
	off.noUrl === true && off.disabled === true && errorsD.length === 0, JSON.stringify(off));

await browser.close();
summarise();
