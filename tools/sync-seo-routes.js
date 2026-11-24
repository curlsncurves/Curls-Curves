import { readFileSync, writeFileSync } from 'node:fs';
import { seoPaths, seoHtml } from '../src/seo-routes.js';

const file = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(file, 'utf8'));
config.rewrites = seoPaths.map(source => ({ source, destination: '/' + seoHtml(source) }));
const json = JSON.stringify(config, null, 2)
  .replace(/    \{\n      "source": ("[^"]+"),\n      "destination": ("[^"]+")\n    \}/g, '    { "source": $1, "destination": $2 }');
writeFileSync(file, json + '\n');
