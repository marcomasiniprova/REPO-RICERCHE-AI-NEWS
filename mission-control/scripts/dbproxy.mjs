// Mini reverse-proxy locale: il browser sandbox non esce, il server si.
import http from 'node:http';
const TARGET = 'https://pclkxvlsswqtcyscztuw.supabase.co';
http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
    });
    return res.end();
  }
  try {
    const url = TARGET + req.url;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const headers = {};
    for (const h of ['apikey', 'authorization', 'content-type', 'prefer', 'accept', 'accept-profile', 'content-profile', 'range']) {
      if (req.headers[h]) headers[h] = req.headers[h];
    }
    const r = await fetch(url, { method: req.method, headers, body });
    res.writeHead(r.status, { 'content-type': r.headers.get('content-type') ?? 'application/json', 'access-control-allow-origin': '*' });
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    res.writeHead(502); res.end(String(e));
  }
}).listen(3300, () => console.log('dbproxy on 3300'));
