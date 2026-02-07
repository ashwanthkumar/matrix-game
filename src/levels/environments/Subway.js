export function buildSubway() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Tunnel background
      ctx.fillStyle = '#0e100e';
      ctx.fillRect(0, 0, width, height);

      // Tiled wall
      const wallG = ctx.createLinearGradient(0, 30, 0, groundY - 50);
      wallG.addColorStop(0, '#1e2018');
      wallG.addColorStop(0.5, '#222418');
      wallG.addColorStop(1, '#1a1c14');
      ctx.fillStyle = wallG;
      ctx.fillRect(0, 30, width, groundY - 80);

      // Tile grid
      const tileP = cameraX * 0.08;
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      for (let tx = -1; tx < width / 30 + 2; tx++) {
        const x = tx * 30 - (tileP % 30);
        ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, groundY - 80); ctx.stroke();
      }
      for (let ty = 30; ty < groundY - 80; ty += 20) {
        ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(width, ty); ctx.stroke();
      }

      // Green accent stripe
      ctx.fillStyle = '#1a3a1a';
      ctx.fillRect(0, 120, width, 30);

      // Fluorescent lights
      for (const lx of [160, 480, 800, 1120]) {
        const lightX = lx - cameraX * 0.05;
        ctx.fillStyle = '#f0fff0';
        ctx.fillRect(lightX - 40, 32, 80, 4);
        const glow = ctx.createRadialGradient(lightX, 34, 5, lightX, 34, 100);
        glow.addColorStop(0, 'rgba(200,255,200,0.1)');
        glow.addColorStop(1, 'rgba(200,255,200,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(lightX - 100, 30, 200, 150);
      }

      // Benches
      const benchP = cameraX * 0.04;
      for (const bx of [250, 700, 1050]) {
        const benchX = bx - benchP;
        ctx.fillStyle = '#3a3a30';
        ctx.fillRect(benchX, groundY - 105, 80, 8);
        ctx.fillStyle = '#2a2a24';
        ctx.fillRect(benchX + 5, groundY - 97, 8, 47);
        ctx.fillRect(benchX + 67, groundY - 97, 8, 47);
      }

      // Platform
      const platG = ctx.createLinearGradient(0, groundY - 50, 0, groundY);
      platG.addColorStop(0, '#4a4a3a');
      platG.addColorStop(1, '#2a2a20');
      ctx.fillStyle = platG;
      ctx.fillRect(0, groundY - 50, width, 50);
      // Safety line
      ctx.fillStyle = '#aa8800';
      ctx.fillRect(0, groundY - 4, width, 4);

      // Tracks below
      ctx.fillStyle = '#0a0a08';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.fillStyle = '#555550';
      ctx.fillRect(0, groundY + 20, width, 3);
      ctx.fillRect(0, groundY + 50, width, 3);
      const tieP2 = cameraX * 0.02;
      ctx.fillStyle = '#2a2a24';
      for (let i = -1; i < width / 30 + 2; i++) {
        ctx.fillRect(i * 30 - (tieP2 % 30), groundY + 14, 12, 44);
      }

      // Tunnel openings
      const tG = ctx.createLinearGradient(0, 0, 60, 0);
      tG.addColorStop(0, '#040604');
      tG.addColorStop(1, 'rgba(4,6,4,0)');
      ctx.fillStyle = tG;
      ctx.fillRect(0, 30, 80, groundY - 30);
      const tG2 = ctx.createLinearGradient(width, 0, width - 60, 0);
      tG2.addColorStop(0, '#040604');
      tG2.addColorStop(1, 'rgba(4,6,4,0)');
      ctx.fillStyle = tG2;
      ctx.fillRect(width - 80, 30, 80, groundY - 30);

      // Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 120, maxX: 1160 },
    playerStart: { x: 400 },
    enemyStart: { x: 880 },
  };
}
