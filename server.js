// =========================================================
// AMORA SMP 2 — server.js
// Petit serveur statique sans dépendance externe, pour Render (Web Service).
// Sert index.html, details.html, style.css, script.js, render.yaml, etc.
// =========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// Types dont le contenu vaut la peine d'être compressé
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt', '.webmanifest']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self'"
  ].join('; ')
};

function cacheControlFor(ext) {
  if (ext === '.html') return 'no-cache';
  if (['.css', '.js', '.webmanifest'].includes(ext)) return 'public, max-age=3600';
  return 'public, max-age=86400';
}

function sendFile(res, filePath, statusCode, acceptEncoding) {
  fs.readFile(filePath, (err, data) => {
    if (err) return send404(res, acceptEncoding);

    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': cacheControlFor(ext),
      ...SECURITY_HEADERS
    };

    if (COMPRESSIBLE.has(ext) && acceptEncoding.includes('gzip')) {
      zlib.gzip(data, (gzErr, compressed) => {
        if (gzErr) {
          res.writeHead(statusCode, headers);
          res.end(data);
          return;
        }
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
        res.writeHead(statusCode, headers);
        res.end(compressed);
      });
      return;
    }

    res.writeHead(statusCode, headers);
    res.end(data);
  });
}

function send404(res, acceptEncoding) {
  const notFoundPath = path.join(ROOT, '404.html');
  fs.readFile(notFoundPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
      res.end(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>404 — Amora SMP 2</title>
<style>body{background:#0d0f0d;color:#e9ece7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
a{color:#6ee66f}</style></head>
<body><div><h1>404</h1><p>Cette page n'existe pas.</p><p><a href="/">Retour à l'accueil</a></p></div></body></html>`);
      return;
    }

    const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', ...SECURITY_HEADERS };
    if (acceptEncoding.includes('gzip')) {
      zlib.gzip(data, (gzErr, compressed) => {
        if (gzErr) { res.writeHead(404, headers); res.end(data); return; }
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
        res.writeHead(404, headers);
        res.end(compressed);
      });
      return;
    }
    res.writeHead(404, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Sécurité : interdit de sortir du dossier du site
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    res.end('403 - Accès refusé');
    return;
  }

  sendFile(res, filePath, 200, acceptEncoding);
});

server.listen(PORT, () => {
  console.log(`Amora SMP 2 en ligne sur le port ${PORT}`);
});
