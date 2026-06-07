import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function resolveAsset(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = normalize(decodedPath).replace(/^([/\\])+/, '');
  const candidate = join(root, relativePath);

  if (!candidate.startsWith(root) || !existsSync(candidate)) return null;
  if (statSync(candidate).isDirectory()) {
    const indexPath = join(candidate, 'index.html');
    return existsSync(indexPath) ? indexPath : null;
  }

  return candidate;
}

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const assetPath = resolveAsset(url.pathname);
  const filePath = assetPath || join(root, 'index.html');
  const extension = extname(filePath).toLowerCase();

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Portfolio dev server running at http://127.0.0.1:${port}/`);
});
