import { chromium } from 'playwright-core';
const [,, url, out, wait = '1800'] = process.argv;
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  ...(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {}),
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 950 },
  ignoreHTTPSErrors: true,
});
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(Number(wait));
await page.screenshot({ path: out });
await browser.close();
console.log('shot →', out);
