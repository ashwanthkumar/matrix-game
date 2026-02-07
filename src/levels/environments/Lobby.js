export function buildLobby() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // High ceiling
      ctx.fillStyle = '#1a1818';
      ctx.fillRect(0, 0, width, groundY);

      // Back wall
      const wallG = ctx.createLinearGradient(0, 30, 0, groundY);
      wallG.addColorStop(0, '#2a2824');
      wallG.addColorStop(0.5, '#3a3830');
      wallG.addColorStop(1, '#2a2824');
      ctx.fillStyle = wallG;
      ctx.fillRect(0, 30, width, groundY - 30);

      // Tall pillars
      const pP = cameraX * 0.08;
      for (const bx of [100, 320, 540, 760, 980, 1200]) {
        const px = bx - pP;
        if (px < -40 || px > width + 40) continue;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(px - 12, 30, 30, groundY - 20);
        const pG = ctx.createLinearGradient(px - 15, 0, px + 15, 0);
        pG.addColorStop(0, '#4a4840');
        pG.addColorStop(0.3, '#6a6858');
        pG.addColorStop(0.7, '#5a5848');
        pG.addColorStop(1, '#3a3830');
        ctx.fillStyle = pG;
        ctx.fillRect(px - 15, 30, 30, groundY - 20);
        ctx.fillStyle = '#5a5848';
        ctx.fillRect(px - 20, 30, 40, 12);
        ctx.fillRect(px - 20, groundY - 12, 40, 14);
      }

      // Glass doors (center)
      const doorX = 640 - cameraX * 0.12;
      ctx.fillStyle = '#1a2a3a';
      ctx.fillRect(doorX - 60, groundY - 200, 120, 200);
      ctx.fillStyle = 'rgba(100,150,200,0.08)';
      ctx.fillRect(doorX - 56, groundY - 196, 52, 192);
      ctx.fillRect(doorX + 4, groundY - 196, 52, 192);
      ctx.fillStyle = '#3a3830';
      ctx.fillRect(doorX - 60, groundY - 200, 4, 200);
      ctx.fillRect(doorX + 56, groundY - 200, 4, 200);
      ctx.fillRect(doorX - 2, groundY - 200, 4, 200);

      // Security desk
      const deskX = 280 - cameraX * 0.05;
      ctx.fillStyle = '#3a3428';
      ctx.fillRect(deskX, groundY - 60, 100, 60);
      ctx.fillStyle = '#4a4438';
      ctx.fillRect(deskX, groundY - 64, 100, 6);
      ctx.fillStyle = '#111';
      ctx.fillRect(deskX + 35, groundY - 90, 30, 24);
      ctx.fillStyle = '#0a2a0a';
      ctx.fillRect(deskX + 37, groundY - 88, 26, 20);

      // Marble floor checkerboard
      const tileSize = 40;
      const tileP = cameraX * 0.02;
      for (let tx = -1; tx < width / tileSize + 2; tx++) {
        for (let ty = 0; ty < (height - groundY) / tileSize + 1; ty++) {
          const x = tx * tileSize - (tileP % tileSize);
          const y = groundY + ty * tileSize;
          ctx.fillStyle = (tx + ty) % 2 === 0 ? '#2a2824' : '#3e3c34';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, groundY, width, 4);

      // Ceiling ornate strip
      ctx.fillStyle = '#4a4838';
      ctx.fillRect(0, 28, width, 6);

      // Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 120, maxX: 1160 },
    playerStart: { x: 400 },
    enemyStart: { x: 880 },
  };
}
