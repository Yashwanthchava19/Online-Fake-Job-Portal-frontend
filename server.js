const http = require('http');
const fs = require('fs');
const path = require('path');

// Detect if npm start was inadvertently run as part of Render's compound build command (e.g. npm start && npm run build)
function detectBuildPhase() {
  try {
    let pid = process.pid;
    for (let depth = 0; depth < 10 && pid > 1; depth++) {
      const cmdPath = `/proc/${pid}/cmdline`;
      if (fs.existsSync(cmdPath)) {
        const cmdline = fs.readFileSync(cmdPath, 'utf8');
        if (cmdline.includes('npm run build') || cmdline.includes('npm start &&') || cmdline.includes('npm start &') || cmdline.includes('build command')) {
          console.log('Build step detected in parent shell. Exiting cleanly so Render build phase can complete.');
          process.exit(0);
        }
      }
      const statPath = `/proc/${pid}/stat`;
      if (fs.existsSync(statPath)) {
        const stat = fs.readFileSync(statPath, 'utf8');
        const lastParen = stat.lastIndexOf(')');
        if (lastParen !== -1) {
          const rest = stat.substring(lastParen + 2).trim();
          const ppid = parseInt(rest.split(/\s+/)[1], 10);
          if (ppid && ppid !== pid) {
            pid = ppid;
            continue;
          }
        }
      }
      break;
    }
  } catch (err) {
    // Non-Linux or unable to read /proc; continue to regular server start
  }
}
detectBuildPhase();

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(__dirname, reqPath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath)) {
        filePath = htmlPath;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
