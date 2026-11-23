import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function registerCaseGallery(app, host) {
  if (!process.argv.includes('--local-case-gallery') || host !== '127.0.0.1') return;
  const folder = resolve('data/case-gallery');
  const manifest = resolve(folder, 'manifest.json');
  if (!existsSync(manifest)) return;
  const cases = JSON.parse(readFileSync(manifest, 'utf8'));
  const photos = new Set(cases.flatMap(item => item.photos.map(photo => photo.file)));

  function localOnly(request, response, next) {
    if (!/^127\.0\.0\.1(?::\d+)?$/.test(request.get('Host') || '') ||
        request.get('Forwarded') || request.get('X-Forwarded-For') ||
        ['cross-site', 'same-site'].includes(request.get('Sec-Fetch-Site'))) {
      return response.sendStatus(404);
    }
    response.set('Cross-Origin-Resource-Policy', 'same-origin');
    return next();
  }

  app.get('/api/case-gallery', localOnly, (_request, response) => response.json({ cases }));
  app.get('/api/case-gallery/image/:file', localOnly, (request, response) => {
    const { file } = request.params;
    if (!/^[a-f0-9]{24}\.webp$/.test(file) || !photos.has(file)) return response.sendStatus(404);
    return response.sendFile(file, { root: folder, cacheControl: false, lastModified: false });
  });
}
