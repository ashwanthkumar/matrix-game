// Resize screenshots for social media sharing
// Instagram feed: 1080x1350 (4:5) — black padding
// WhatsApp Status / Instagram Stories: 1080x1920 (9:16) — black padding

import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const SOURCES = [
  'screenshots/01-main-menu.png',
  'screenshots/02-character-select.png',
  'screenshots/05-canvas-punch.png',
  'screenshots/13-credits.png',
];

const INSTAGRAM_DIR = 'screenshots/instagram';
const WHATSAPP_DIR = 'screenshots/whatsapp-status';

mkdirSync(INSTAGRAM_DIR, { recursive: true });
mkdirSync(WHATSAPP_DIR, { recursive: true });

async function resizeWithPadding(inputPath, outputPath, width, height) {
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png()
    .toFile(outputPath);
}

async function main() {
  for (const src of SOURCES) {
    const name = src.split('/').pop();

    // Instagram feed — 1080x1350 (4:5)
    const igOut = join(INSTAGRAM_DIR, name);
    await resizeWithPadding(src, igOut, 1080, 1350);
    console.log(`Instagram: ${igOut}`);

    // WhatsApp Status / Stories — 1080x1920 (9:16)
    const waOut = join(WHATSAPP_DIR, name);
    await resizeWithPadding(src, waOut, 1080, 1920);
    console.log(`WhatsApp:  ${waOut}`);
  }

  console.log('\nDone! Images ready for sharing.');
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
