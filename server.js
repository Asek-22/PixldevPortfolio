/**
 * server.js — Production-ready сервер для Railway
 *
 * - Раздаёт статику (index.html, css/, js/)
 * - Хранит проекты в data.json (не в HTML)
 * - Читает PORT из env для Railway
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = process.env.PORT || 3777;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC    = __dirname;

// MIME-типы для статических файлов
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
};

// ── Утилиты ──────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end',  ()    => resolve(data));
    req.on('error', reject);
  });
}

function loadProjects() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf8');
}

function serveStatic(req, res) {
  // / → index.html
  const urlPath  = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(PUBLIC, urlPath);

  // Защита от path traversal
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const content = fs.readFileSync(filePath);
    const ext     = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

// ── Сервер ───────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /projects — отдать текущий список проектов
  if (req.method === 'GET' && req.url === '/projects') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(loadProjects()));
    return;
  }

  // POST /save — сохранить список проектов
  if (req.method === 'POST' && req.url === '/save') {
    try {
      const body     = await readBody(req);
      const projects = JSON.parse(body);

      if (!Array.isArray(projects)) throw new Error('Данные должны быть массивом');

      saveProjects(projects);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: projects.length }));
      console.log(`✓ Сохранено проектов: ${projects.length}`);
    } catch (err) {
      console.error('✗ Ошибка сохранения:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // Всё остальное — статика
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущен: http://localhost:${PORT}\n`);
});
