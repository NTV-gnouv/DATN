import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = Number(process.env.FRONTEND_PORT || process.env.PORT || 8080);
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3000);
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const SERVICE = 'frontend';

function log(level, message) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${SERVICE}] [${level}] ${message}`);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
};

function proxyToBackend(req, res) {
  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${BACKEND_HOST}:${BACKEND_PORT}` },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    log('INFO', `${req.method} ${req.url} → proxy ${proxyRes.statusCode}`);
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    log('ERROR', `Proxy ${req.method} ${req.url}: ${error.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad gateway');
    }
  });

  req.pipe(proxyReq);
}

function sendFile(res, filePath, req) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] ?? 'application/octet-stream';
  const stream = fs.createReadStream(filePath);

  stream.on('error', () => {
    log('WARN', `${req.method} ${req.url} → 404 ${filePath}`);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });

  stream.on('open', () => {
    log('INFO', `${req.method} ${req.url} → 200 ${path.basename(filePath)}`);
    res.writeHead(200, { 'Content-Type': type });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);

  if (urlPath === '/api' || urlPath.startsWith('/api/')) {
    proxyToBackend(req, res);
    return;
  }

  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  if (!filePath.startsWith(ROOT)) {
    log('WARN', `${req.method} ${req.url} → 403 forbidden path`);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    log('INFO', `${req.method} ${req.url} → SPA fallback index.html`);
    sendFile(res, path.join(ROOT, 'index.html'), req);
    return;
  }

  sendFile(res, filePath, req);
});

server.on('error', (error) => {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
    log('ERROR', `Port ${PORT} đã được sử dụng (EADDRINUSE). Chạy: bash stop.sh`);
  } else {
    log('ERROR', `Server error: ${error instanceof Error ? error.message : String(error)}`);
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log('ERROR', `uncaughtException: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log('ERROR', `unhandledRejection: ${String(reason)}`);
});

server.listen(PORT, '0.0.0.0', () => {
  log(
    'INFO',
    `Listening on http://0.0.0.0:${PORT} (root=${ROOT}, api→${BACKEND_HOST}:${BACKEND_PORT})`,
  );
});
