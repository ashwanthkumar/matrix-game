// ============================================================
// Playwright Screenshot Script for Matrix: Reloaded
// Captures character models during gameplay for visual review
// ============================================================

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const SCREENSHOTS_DIR = './screenshots';
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 1280, height: 720 };

mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function screenshot(page, name) {
  const path = `${SCREENSHOTS_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  -> ${path}`);
  return path;
}

async function screenshotCanvas(page, name) {
  const path = `${SCREENSHOTS_DIR}/${name}.png`;
  const canvas = page.locator('#game-canvas');
  await canvas.screenshot({ path });
  console.log(`  -> ${path} (canvas only)`);
  return path;
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // Navigate to game
    console.log('Loading game...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for loading screen to finish and main menu to appear
    console.log('Waiting for main menu...');
    await page.waitForSelector('#main-menu', { state: 'visible', timeout: 10000 });
    await delay(500);
    await screenshot(page, '01-main-menu');

    // Click "NEW GAME" — Neo is pre-selected as default
    console.log('Starting new game...');
    await page.click('.menu-option[data-action="start"]');
    await delay(500);

    // Character select screen — Neo is already selected
    console.log('Character select...');
    const charSelectVisible = await page.locator('#character-select').isVisible();
    if (charSelectVisible) {
      await screenshot(page, '02-character-select');
      // Neo is already selected so clicking confirms immediately
      await page.click('.character-card[data-character="neo"]');
    }

    // Wait for level loading
    console.log('Loading level...');
    await delay(2500);

    // Skip through intro dialogue by pressing Enter
    console.log('Skipping dialogue...');
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Enter');
      await delay(500);
    }

    // Wait for gameplay to start
    console.log('Waiting for gameplay...');
    await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    await delay(1500);

    // ============================================
    // GAMEPLAY SCREENSHOTS
    // ============================================
    console.log('\n=== GAMEPLAY SCREENSHOTS ===\n');

    // 1. Idle stance
    console.log('1. Idle stance...');
    await screenshot(page, '03-gameplay-idle');
    await screenshotCanvas(page, '03-canvas-idle');

    // 2. Walk toward enemy
    console.log('2. Approaching enemy...');
    await page.keyboard.down('d');
    await delay(1000);
    await page.keyboard.up('d');
    await delay(300);
    await screenshot(page, '04-gameplay-approach');
    await screenshotCanvas(page, '04-canvas-approach');

    // 3. Punch (light attack)
    console.log('3. Punch attack...');
    await page.keyboard.press('j');
    await delay(80);
    await screenshotCanvas(page, '05-canvas-punch');
    await delay(500);

    // 4. Kick (heavy attack)
    console.log('4. Kick attack...');
    await page.keyboard.press('k');
    await delay(120);
    await screenshotCanvas(page, '06-canvas-kick');
    await delay(600);

    // 5. More punches for combo & energy
    console.log('5. Combo attacks...');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('j');
      await delay(350);
    }
    await page.keyboard.press('k');
    await delay(120);
    await screenshotCanvas(page, '07-canvas-combo');
    await delay(400);

    // 6. Block pose
    console.log('6. Block pose...');
    await page.keyboard.down('i');
    await delay(400);
    await screenshotCanvas(page, '08-canvas-block');
    await page.keyboard.up('i');
    await delay(200);

    // 7. Walking animation
    console.log('7. Walking...');
    await page.keyboard.down('a');
    await delay(300);
    await screenshotCanvas(page, '09-canvas-walk');
    await page.keyboard.up('a');
    await delay(200);

    // 8. Let enemy attack (stand still) for hitstun shot
    console.log('8. Waiting for enemy hit...');
    await delay(3000);
    await screenshotCanvas(page, '10-canvas-combat-action');

    // 9. Dodge
    console.log('9. Dodge...');
    await page.keyboard.press(' ');
    await delay(80);
    await screenshotCanvas(page, '11-canvas-dodge');
    await delay(600);

    // 10. Full game screenshot with HUD
    console.log('10. Full game with HUD...');
    await page.keyboard.press('j');
    await delay(100);
    await screenshot(page, '12-full-game-combat');

    console.log('\n=== ALL SCREENSHOTS CAPTURED ===');
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}/\n`);

  } catch (err) {
    console.error('Error:', err.message);
    await screenshot(page, 'ERROR-state').catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
