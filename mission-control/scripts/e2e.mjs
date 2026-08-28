import { chromium } from 'playwright-core';
const PIN = process.env.E2E_PIN;
const SH = process.env.SHOT_DIR;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'], proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } });
const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));

// 1. Bozze con la bozza di collaudo
await p.goto('http://localhost:3200/bozze', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3500);
await p.screenshot({ path: SH + '/e2e1_bozze.png' });

// 2. Click Approva → modal PIN
await p.getByRole('button', { name: 'Approva', exact: true }).first().click();
await p.waitForTimeout(600);
await p.screenshot({ path: SH + '/e2e2_pinmodal.png' });

// 3. PIN sbagliato → errore
await p.locator('input[type="password"]').fill('000000');
await p.getByRole('button', { name: 'Conferma' }).click();
await p.waitForTimeout(1200);
const err = await p.locator('text=PIN errato').count();
console.log('PIN sbagliato respinto:', err > 0 ? 'SI' : 'NO');
await p.screenshot({ path: SH + '/e2e3_pinwrong.png' });

// 4. PIN giusto → approvata
await p.locator('input[type="password"]').fill(PIN);
await p.getByRole('button', { name: 'Conferma' }).click();
await p.waitForTimeout(2000);
await p.screenshot({ path: SH + '/e2e4_approvata.png' });
await p.goto('http://localhost:3200/bozze', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
await p.locator('text=Approvate').click();
await p.waitForTimeout(600);
await p.screenshot({ path: SH + '/e2e5_lista_approvate.png' });

// 5. Messaggi
await p.goto('http://localhost:3200/messaggi', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3500);
await p.screenshot({ path: SH + '/e2e6_messaggi.png' });

// 6. Creator drawer (Trolleygirl)
await p.goto('http://localhost:3200/creator', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3000);
await p.locator('text=Trolleygirl').first().click();
await p.waitForTimeout(1200);
await p.screenshot({ path: SH + '/e2e7_creator_drawer.png' });

await b.close();
console.log('E2E COMPLETO');
