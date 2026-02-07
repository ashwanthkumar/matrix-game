export function buildOffice() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Ceiling
      ctx.fillStyle = '#1a1a1e';
      ctx.fillRect(0, 0, width, 42);

      // Back wall
      const wallGrad = ctx.createLinearGradient(0, 42, 0, groundY);
      wallGrad.addColorStop(0, '#22242a');
      wallGrad.addColorStop(1, '#1e2024');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 42, width, groundY - 42);

      // Fluorescent lights
      for (const lx of [200, 520, 840, 1100]) {
        const lightX = lx - cameraX * 0.1;
        ctx.fillStyle = '#444448';
        ctx.fillRect(lightX - 60, 42, 120, 8);
        ctx.fillStyle = '#e8ffe8';
        ctx.fillRect(lightX - 50, 44, 100, 4);
        const glow = ctx.createLinearGradient(0, 42, 0, groundY);
        glow.addColorStop(0, 'rgba(200,255,200,0.06)');
        glow.addColorStop(0.5, 'rgba(200,255,200,0.02)');
        glow.addColorStop(1, 'rgba(200,255,200,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.moveTo(lightX - 50, 50); ctx.lineTo(lightX - 120, groundY);
        ctx.lineTo(lightX + 120, groundY); ctx.lineTo(lightX + 50, 50);
        ctx.closePath(); ctx.fill();
      }

      // Windows with city view
      const winP = cameraX * 0.2;
      for (const wx of [100, 380, 660, 940, 1180]) {
        const winX = wx - winP;
        if (winX < -100 || winX > width + 100) continue;
        ctx.fillStyle = '#1a1a1e';
        ctx.fillRect(winX - 52, 80, 104, 160);
        ctx.fillStyle = '#060812';
        ctx.fillRect(winX - 48, 84, 96, 152);
        ctx.fillStyle = '#0a1a10';
        ctx.fillRect(winX - 48, 180, 96, 56);
        for (let bx = 0; bx < 8; bx++) {
          for (let by = 0; by < 4; by++) {
            if (Math.sin(bx * 7.3 + by * 13.7 + wx) > 0.2) {
              ctx.fillStyle = Math.sin(bx * 3.1 + by * 5.7) > 0 ? '#40ff60' : '#ffee80';
              ctx.globalAlpha = 0.3;
              ctx.fillRect(winX - 44 + bx * 12, 186 + by * 12, 4, 4);
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // Cubicle partitions
      const cubP = cameraX * 0.05;
      for (const cx of [160, 440, 720, 1000]) {
        const cubX = cx - cubP;
        if (cubX < -80 || cubX > width + 80) continue;
        const cubTop = groundY - 180;
        ctx.fillStyle = '#4a4a52';
        ctx.fillRect(cubX, cubTop, 140, 180);
        ctx.fillStyle = '#5a5a60';
        ctx.fillRect(cubX, cubTop - 2, 140, 5);
        // Desk
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(cubX + 5, groundY - 80, 130, 6);
        // Monitor
        const monX = cubX + 70;
        ctx.fillStyle = '#1a1a1e';
        ctx.fillRect(monX - 28, groundY - 130, 56, 40);
        const scr = ctx.createRadialGradient(monX, groundY - 112, 3, monX, groundY - 112, 30);
        scr.addColorStop(0, '#0a3a0a');
        scr.addColorStop(1, '#061a06');
        ctx.fillStyle = scr;
        ctx.fillRect(monX - 25, groundY - 127, 50, 34);
        ctx.fillStyle = '#00cc44';
        ctx.globalAlpha = 0.6;
        for (let row = 0; row < 5; row++) {
          ctx.fillRect(monX - 20, groundY - 123 + row * 6, 15 + Math.sin(row * 3.7 + cx) * 12, 2);
        }
        ctx.globalAlpha = 1;
        // Monitor stand
        ctx.fillStyle = '#222226';
        ctx.fillRect(monX - 3, groundY - 90, 6, 10);
        ctx.fillRect(monX - 12, groundY - 82, 24, 4);
      }

      // Floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, height);
      floorGrad.addColorStop(0, '#3a3a3e');
      floorGrad.addColorStop(1, '#1e1e22');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

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
