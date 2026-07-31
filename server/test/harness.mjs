// Shared bits for the three suites. Deliberately tiny - there is no test runner
// here, because the interesting assertions are about timing and rendering rather
// than return values, and a runner would only get in the way of reading them.

export const results = [];

export function check(name, ok, detail) {
	results.push({ name, ok, detail });
	console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  -> ' + detail : ''));
}

export function summarise() {
	const failed = results.filter(r => !r.ok);
	console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
	process.exit(failed.length ? 1 : 0);
}

export const wait = ms => new Promise(r => setTimeout(r, ms));

// Polls until the page evaluates to something truthy. Used instead of fixed sleeps
// wherever the thing being waited for is a network round trip.
export async function waitFor(page, fn, label, timeout = 15000) {
	const start = Date.now();

	while (Date.now() - start < timeout) {
		const value = await page.evaluate(fn).catch(() => null);
		if (value)
			return value;

		await page.waitForTimeout(200);
	}

	throw new Error('timed out waiting for ' + label);
}

// PW_CHROMIUM covers environments where the browser is not where Playwright
// expects it (a preinstalled one in a container, say).
export function launchOptions() {
	return process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
}

// The site loads jQuery and Bootstrap from CDNs. Somewhere without access to them
// every page throws the same two errors, on this code and on a pristine checkout
// alike, so they are not evidence of anything and would otherwise mask real ones.
export const isCdnError = e => /jQuery is not defined|\$ is not defined/.test(String(e));

// Only needed where outbound TLS goes through a proxy. Absent, this returns nothing
// and the sockets connect directly.
export async function wsOptions(url) {
	if (!url.startsWith('wss://') || !process.env.HTTPS_PROXY)
		return {};

	try {
		const { HttpsProxyAgent } = await import('https-proxy-agent');
		return { agent: new HttpsProxyAgent(process.env.HTTPS_PROXY) };
	} catch (err) {
		return {};
	}
}

export const SITE_URL = process.env.SITE_URL || 'http://localhost:8000/index.html';
export const RELAY_URL = process.argv[2] || process.env.RELAY_URL || 'ws://localhost:8787/ws';
export const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '';
