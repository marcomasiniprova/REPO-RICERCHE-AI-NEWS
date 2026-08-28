import { chromium } from 'playwright-core';
const proxy = process.env.HTTPS_PROXY;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
for (const cfg of [
  { name: 'proxy+bypass', opts: { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } },
  { name: 'no-proxy-cfg', opts: {} },
]) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'], ...cfg.opts });
  const p = await b.newPage({ ignoreHTTPSErrors: true });
  await p.goto('http://localhost:3200/api/health');
  try {
    const r = await p.evaluate(async (key) => {
      const res = await fetch('https://pclkxvlsswqtcyscztuw.supabase.co/rest/v1/agents?select=slug', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
      return res.status + ' ' + (await res.text()).slice(0, 60);
    }, anon);
    console.log(cfg.name, 'FETCH OK:', r);
  } catch (e) {
    console.log(cfg.name, 'FETCH FAIL:', String(e).slice(0, 120));
  }
  await b.close();
}
