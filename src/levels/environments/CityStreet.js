export function buildCityStreet() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Night sky
      const skyG = ctx.createLinearGradient(0, 0, 0, groundY);
      skyG.addColorStop(0, '#04060e');
      skyG.addColorStop(0.5, '#0a0e18');
      skyG.addColorStop(1, '#101820');
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, width, groundY);

      // Far buildings (parallax 0.12)
      const farP = cameraX * 0.12;
      for (let i = 0; i < 20; i++) {
        const bx = i * 70 - farP;
        const bh = 150 + Math.sin(i * 5.1) * 80;
        const bw = 40 + Math.sin(i * 3.3) * 15;
        if (bx + bw < -10 || bx > width + 10) continue;
        ctx.fillStyle = '#080c14';
        ctx.fillRect(bx, groundY - bh, bw, bh);
        for (let wy = 8; wy < bh - 4; wy += 12) {
          for (let wx = 4; wx < bw - 4; wx += 8) {
            if (Math.sin(wx * 5.3 + wy * 3.7 + i * 7) > 0.2) {
              ctx.fillStyle = Math.sin(wx + wy) > 0 ? '#40ff60' : '#ffcc40';
              ctx.globalAlpha = 0.12;
              ctx.fillRect(bx + wx, groundY - bh + wy, 4, 5);
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Near buildings (parallax 0.06)
      const nearP = cameraX * 0.06;
      const nearBuildings = [
        { x: 0, w: 120, h: 380 }, { x: 140, w: 100, h: 300 },
        { x: 900, w: 130, h: 350 }, { x: 1050, w: 110, h: 280 },
        { x: 1180, w: 100, h: 320 },
      ];
      for (const b of nearBuildings) {
        const bx = b.x - nearP;
        if (bx + b.w < -10 || bx > width + 10) continue;
        ctx.fillStyle = '#0c1018';
        ctx.fillRect(bx, groundY - b.h, b.w, b.h);
        for (let wy = 10; wy < b.h - 10; wy += 16) {
          for (let wx = 8; wx < b.w - 8; wx += 12) {
            if (Math.sin(wx * 3.1 + wy * 7.7 + b.x) > 0.15) {
              ctx.fillStyle = Math.sin(wx + wy + b.x) > 0.3 ? '#40ff60' : '#ffee80';
              ctx.globalAlpha = 0.2;
              ctx.fillRect(bx + wx, groundY - b.h + wy, 6, 8);
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Street lights
      const lampP = cameraX * 0.03;
      for (const lx of [200, 500, 800, 1100]) {
        const lampX = lx - lampP;
        ctx.fillStyle = '#333';
        ctx.fillRect(lampX - 3, groundY - 130, 6, 130);
        // Lamp head
        ctx.fillStyle = '#444';
        ctx.fillRect(lampX - 15, groundY - 134, 30, 6);
        // Glow
        const glow = ctx.createRadialGradient(lampX, groundY - 130, 5, lampX, groundY - 130, 100);
        glow.addColorStop(0, 'rgba(255,220,150,0.1)');
        glow.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(lampX - 100, groundY - 200, 200, 140);
      }

      // Traffic light
      const tlX = 350 - cameraX * 0.03;
      ctx.fillStyle = '#222';
      ctx.fillRect(tlX - 2, groundY - 160, 4, 160);
      ctx.fillRect(tlX - 10, groundY - 180, 20, 50);
      ctx.fillStyle = '#ff0000';
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(tlX, groundY - 168, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333300';
      ctx.beginPath(); ctx.arc(tlX, groundY - 155, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#003300';
      ctx.beginPath(); ctx.arc(tlX, groundY - 142, 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Road
      const roadG = ctx.createLinearGradient(0, groundY, 0, height);
      roadG.addColorStop(0, '#1e1e22');
      roadG.addColorStop(1, '#141418');
      ctx.fillStyle = roadG;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Road center line
      const lineP = cameraX * 0.02;
      ctx.fillStyle = '#888844';
      for (let i = -1; i < width / 50 + 2; i++) {
        ctx.fillRect(i * 50 - (lineP % 50), groundY + 35, 30, 3);
      }

      // Sidewalk edge
      ctx.fillStyle = '#2a2a2e';
      ctx.fillRect(0, groundY - 4, width, 4);

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
