// =========================================================
// AMORA SMP 2 — server.js
// Petit serveur statique sans dépendance externe, pour Render (Web Service).
// Sert index.html, details.html, style.css, script.js, render.yaml, etc.
// =========================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

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
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, urlPath));

  // Sécurité : interdit de sortir du dossier du site
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 - Accès refusé');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Page introuvable -> petite page 404 sombre cohérente avec le site
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>404 — Amora SMP 2</title>
<style>body{background:#0d0f0d;color:#e9ece7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}
a{color:#6ee66f}</style></head>
<body><div><h1>404</h1><p>Cette page n'existe pas.</p><p><a href="/">Retour à l'accueil</a></p></div></body></html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Amora SMP 2 en ligne sur le port ${PORT}`);
});
