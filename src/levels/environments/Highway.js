export function buildHighway() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Night sky
      const skyG = ctx.createLinearGradient(0, 0, 0, groundY);
      skyG.addColorStop(0, '#060810');
      skyG.addColorStop(0.7, '#0a1020');
      skyG.addColorStop(1, '#141a28');
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, width, groundY);

      // Distant cityscape (deep parallax)
      const cityP = cameraX * 0.05;
      for (let i = 0; i < 15; i++) {
        const bx = i * 90 + 20 - cityP;
        const bh = 80 + Math.sin(i * 3.7) * 60;
        const bw = 40 + Math.sin(i * 2.1) * 20;
        ctx.fillStyle = '#080c14';
        ctx.fillRect(bx, groundY - bh - 120, bw, bh);
        for (let wy = 6; wy < bh - 4; wy += 10) {
          for (let wx = 4; wx < bw - 4; wx += 8) {
            if (Math.sin(wx * 5.3 + wy * 3.7 + i) > 0.3) {
              ctx.fillStyle = '#40ff60';
              ctx.globalAlpha = 0.1;
              ctx.fillRect(bx + wx, groundY - bh - 120 + wy, 3, 4);
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Overpass structure (concrete)
      ctx.fillStyle = '#222228';
      ctx.fillRect(0, groundY - 20, width, 20);

      // Support pillars going down
      const pilP = cameraX * 0.06;
      for (const px of [80, 400, 720, 1040]) {
        const pX = px - pilP;
        ctx.fillStyle = '#2a2a30';
        ctx.fillRect(pX - 15, groundY, 30, height - groundY);
        ctx.fillStyle = '#333338';
        ctx.fillRect(pX - 20, groundY - 4, 40, 8);
      }

      // Road surface
      const roadG = ctx.createLinearGradient(0, groundY, 0, height);
      roadG.addColorStop(0, '#2a2a2e');
      roadG.addColorStop(0.05, '#222226');
      roadG.addColorStop(1, '#181818');
      ctx.fillStyle = roadG;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Road markings (dashed center line)
      const lineP = cameraX * 0.02;
      ctx.fillStyle = '#888844';
      for (let i = -1; i < width / 50 + 2; i++) {
        const lx = i * 50 - (lineP % 50);
        ctx.fillRect(lx, groundY + 30, 30, 3);
      }

      // Guard rails
      ctx.fillStyle = '#555558';
      ctx.fillRect(0, groundY - 10, width, 4);
      // Rail posts
      const railP = cameraX * 0.02;
      for (let i = -1; i < width / 60 + 2; i++) {
        const rx = i * 60 - (railP % 60);
        ctx.fillRect(rx, groundY - 18, 4, 18);
      }

      // Moving car headlights (decorative)
      const t = Date.now() * 0.001;
      for (let c = 0; c < 3; c++) {
        const cx = ((t * 100 + c * 500) % (width + 200)) - 100;
        ctx.fillStyle = '#ffcc40';
        ctx.globalAlpha = 0.15;
        ctx.fillRect(cx, groundY + 25, 6, 4);
        ctx.fillRect(cx + 12, groundY + 25, 6, 4);
        ctx.globalAlpha = 1;
      }

      // Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 80, maxX: 1200 },
    playerStart: { x: 380 },
    enemyStart: { x: 900 },
  };
}
