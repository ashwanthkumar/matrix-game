// ============================================================
// Playwright Gameplay Video Recorder — Level 1 as Neo
// Records completing "I Know Kung Fu" (vs Morpheus) in the dojo
// ============================================================

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const VIDEO_DIR = './videos';
const BASE_URL = 'http://localhost:5173/matrix-game/';
const VIEWPORT = { width: 1280, height: 720 };

mkdirSync(VIDEO_DIR, { recursive: true });

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Launching browser with video recording...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: {
      dir: VIDEO_DIR,
      size: VIEWPORT,
    },
  });
  const page = await context.newPage();

  try {
    // ---- Main Menu ----
    console.log('Loading game...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('#main-menu', { state: 'visible', timeout: 15000 });
    await delay(2000); // Let the Matrix rain render

    // ---- Start New Game ----
    console.log('Starting new game...');
    await page.click('.menu-option[data-action="start"]');
    await delay(800);

    // ---- Character Select — pick Neo ----
    console.log('Selecting Neo...');
    const charSelect = page.locator('#character-select');
    await charSelect.waitFor({ state: 'visible', timeout: 5000 });
    await delay(500);
    await page.click('.character-card[data-character="neo"]');
    await delay(500);
    // Confirm selection
    await page.keyboard.press('Enter');

    // ---- Loading screen ----
    console.log('Loading level...');
    await delay(2500);

    // ---- Intro dialogue — skip through all lines ----
    console.log('Skipping intro dialogue...');
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Enter');
      await delay(600);
    }

    // ---- Wait for HUD / gameplay ----
    console.log('Waiting for gameplay...');
    try {
      await page.waitForSelector('#hud', { state: 'visible', timeout: 15000 });
    } catch {
      console.log('HUD not detected, continuing anyway...');
    }
    await delay(1000);

    // ============================================
    // COMBAT — defeat Morpheus
    // ============================================
    console.log('\n=== COMBAT START ===\n');

    // Strategy: approach, mix punches and kicks, use special when available
    // Morpheus has 60 HP. Punch=5, Kick=10, Special=20 damage.
    // Be cinematic — move around, vary attacks, block occasionally.

    // Approach the enemy
    console.log('Approaching...');
    await page.keyboard.down('d');
    await delay(1200);
    await page.keyboard.up('d');
    await delay(300);

    // Round 1: Opening punches
    console.log('Attack round 1...');
    await page.keyboard.press('j');
    await delay(350);
    await page.keyboard.press('j');
    await delay(350);
    await page.keyboard.press('k'); // kick
    await delay(500);

    // Dodge back
    console.log('Dodging...');
    await page.keyboard.press(' ');
    await delay(600);

    // Move back in
    await page.keyboard.down('d');
    await delay(400);
    await page.keyboard.up('d');
    await delay(200);

    // Round 2: More aggressive
    console.log('Attack round 2...');
    await page.keyboard.press('j');
    await delay(300);
    await page.keyboard.press('j');
    await delay(300);
    await page.keyboard.press('j');
    await delay(300);
    await page.keyboard.press('k');
    await delay(500);

    // Block briefly
    console.log('Blocking...');
    await page.keyboard.down('i');
    await delay(800);
    await page.keyboard.up('i');
    await delay(300);

    // Round 3: Close in and finish
    console.log('Attack round 3...');
    await page.keyboard.down('d');
    await delay(300);
    await page.keyboard.up('d');

    await page.keyboard.press('j');
    await delay(300);
    await page.keyboard.press('k');
    await delay(400);

    // Try special attack (should have enough energy by now)
    console.log('Special attack...');
    await page.keyboard.press('l');
    await delay(600);

    // Round 4: Keep attacking in case Morpheus is still alive
    console.log('Attack round 4...');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('j');
      await delay(300);
      await page.keyboard.press('k');
      await delay(400);
    }

    // Round 5: Final push — spam attacks
    console.log('Final push...');
    await page.keyboard.down('d');
    await delay(200);
    await page.keyboard.up('d');

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('j');
      await delay(250);
      await page.keyboard.press('k');
      await delay(350);
    }

    // Special again if available
    await page.keyboard.press('l');
    await delay(600);

    // More attacks to be safe
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('j');
      await delay(250);
      await page.keyboard.press('k');
      await delay(350);
    }

    // ---- Wait for level complete ----
    console.log('\nWaiting for level complete...');
    await delay(3000);

    // ---- Victory dialogue — skip through ----
    console.log('Skipping victory dialogue...');
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Enter');
      await delay(800);
    }

    // ---- Score screen ----
    console.log('Score screen...');
    await delay(3000);

    // Let the score screen linger for the video
    await delay(2000);

    console.log('\n=== LEVEL 1 COMPLETE ===\n');

  } catch (err) {
    console.error('Error during recording:', err.message);
  } finally {
    // Close to finalize the video
    await page.close();
    await context.close();
    await browser.close();
  }

  console.log(`Video saved to: ${VIDEO_DIR}/`);
  console.log('Done!');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
