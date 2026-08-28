import { chromium } from 'playwright-core';
const SH = process.env.SHOT_DIR;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'], proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } });
const p = await b.newPage({ viewport: { width: 1600, height: 950 } });

await p.goto('http://localhost:3200/bozze', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
await p.getByRole('button', { name: /Approvate/ }).click();
await p.waitForTimeout(700);
await p.screenshot({ path: SH + '/e2e5_lista_approvate.png' });

await p.goto('http://localhost:3200/messaggi', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3500);
await p.screenshot({ path: SH + '/e2e6_messaggi.png' });

await p.goto('http://localhost:3200/creator', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
await p.locator('text=Trolleygirl').first().click();
await p.waitForTimeout(1300);
await p.screenshot({ path: SH + '/e2e7_creator_drawer.png' });

await p.goto('http://localhost:3200/reddit', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
await p.screenshot({ path: SH + '/e2e8_reddit.png' });

await b.close();
console.log('OK');
