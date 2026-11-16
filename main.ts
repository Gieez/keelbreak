import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';
const root = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const screenshotNames = readdirSync(join(root, 'screenshots')).filter(name => /\.jpe?g$/i.test(name));
if (screenshotNames.length < 3 || screenshotNames.length > 4) throw new Error('Expected 3 or 4 JPEG screenshots');
for (const name of screenshotNames) {
  const bytes = readFileSync(join(root, 'screenshots', name));
  let dimensions: [number, number] | undefined;
  for (let offset = 2; offset + 8 < bytes.length;) {
    if (bytes[offset] !== 255) { offset++; continue; }
    const marker = bytes[offset + 1]; offset += 2;
    if (marker === 216 || marker === 217) continue;
    const length = bytes.readUInt16BE(offset);
    if ([192, 193, 194].includes(marker)) {
      dimensions = [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)]; break;
    }
    if (length < 2) break;
    offset += length;
  }
  if (!dimensions || Math.max(...dimensions) > 1280 || Math.min(...dimensions) < 480 || bytes.length > 262144)
    throw new Error(`Screenshot outside grader limits: ${name}`);
}
mkdirSync(out, { recursive: true });
// Require fresh output rather than silently shipping files left by an older revision.
for (const name of ['game', 'screenshots']) {
  if (existsSync(join(out, name))) throw new Error('Use a fresh MAKEFUN_OUTPUT_DIR: ' + name + ' already exists');
}
cpSync(join(root, 'game'), join(out, 'game'), { recursive: true });
cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });
writeFileSync(join(out, 'dossier.json'), buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
}));
