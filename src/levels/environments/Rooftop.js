export function buildRooftop() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Night sky
      const skyG = ctx.createLinearGradient(0, 0, 0, groundY);
      skyG.addColorStop(0, '#04060e');
      skyG.addColorStop(0.6, '#0a0e1a');
      skyG.addColorStop(1, '#101828');
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, width, groundY);

      // Stars
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5 + cameraX * 0.02) % width;
        const sy = (i * 97.3) % (groundY * 0.5);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(i * 2.3) * 0.2})`;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // City skyline (parallax)
      const skyP = cameraX * 0.1;
      const buildings = [
        { x: 50, w: 80, h: 200 }, { x: 160, w: 60, h: 280 },
        { x: 250, w: 90, h: 160 }, { x: 370, w: 70, h: 320 },
        { x: 470, w: 100, h: 240 }, { x: 600, w: 60, h: 300 },
        { x: 690, w: 80, h: 180 }, { x: 800, w: 110, h: 350 },
        { x: 940, w: 70, h: 220 }, { x: 1040, w: 90, h: 260 },
        { x: 1160, w: 60, h: 190 },
      ];
      for (const b of buildings) {
        const bx = b.x - skyP;
        if (bx + b.w < -20 || bx > width + 20) continue;
        ctx.fillStyle = '#0a0e14';
        ctx.fillRect(bx, groundY - b.h - 40, b.w, b.h + 40);
        for (let wx = 6; wx < b.w - 6; wx += 10) {
          for (let wy = 8; wy < b.h; wy += 14) {
            if (Math.sin(wx * 3.1 + wy * 7.7 + b.x) > 0.1) {
              ctx.fillStyle = Math.sin(wx + wy + b.x * 0.1) > 0.3 ? '#40ff60' : '#ffcc40';
              ctx.globalAlpha = 0.15 + Math.sin(wx * wy * 0.01) * 0.1;
              ctx.fillRect(bx + wx, groundY - b.h - 40 + wy, 5, 6);
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Rooftop surface
      const roofG = ctx.createLinearGradient(0, groundY, 0, height);
      roofG.addColorStop(0, '#2a2a2e');
      roofG.addColorStop(1, '#181818');
      ctx.fillStyle = roofG;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Low walls
      ctx.fillStyle = '#333338';
      ctx.fillRect(0, groundY - 30, 60, 30);
      ctx.fillRect(width - 60, groundY - 30, 60, 30);

      // AC units
      const acP = cameraX * 0.03;
      for (const ax of [120, 1080]) {
        const acX = ax - acP;
        ctx.fillStyle = '#3a3a3e';
        ctx.fillRect(acX, groundY - 50, 60, 50);
        ctx.fillStyle = '#444448';
        ctx.fillRect(acX, groundY - 54, 60, 6);
        ctx.strokeStyle = '#2a2a2e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(acX + 30, groundY - 25, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Vent pipe
      ctx.fillStyle = '#333';
      ctx.fillRect(900 - acP, groundY - 80, 12, 80);
      ctx.fillRect(896 - acP, groundY - 84, 20, 8);

      // Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 100, maxX: 1180 },
    playerStart: { x: 380 },
    enemyStart: { x: 900 },
  };
}
