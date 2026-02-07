export function buildConstruct(dark = false) {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      if (dark) {
        // Dark construct (Smith's version) - void with matrix rain
        ctx.fillStyle = '#020402';
        ctx.fillRect(0, 0, width, height);

        // Falling matrix characters (decorative)
        ctx.fillStyle = '#00ff41';
        const t = Date.now() * 0.001;
        for (let col = 0; col < 40; col++) {
          const x = col * 32 + 8;
          const speed = 40 + Math.sin(col * 3.7) * 20;
          const offset = (t * speed + col * 100) % (height + 200) - 100;
          for (let ch = 0; ch < 6; ch++) {
            const cy = offset - ch * 18;
            if (cy < 0 || cy > height) continue;
            const alpha = (1 - ch / 6) * 0.15;
            ctx.globalAlpha = alpha;
            ctx.fillRect(x, cy, 8, 12);
          }
        }
        ctx.globalAlpha = 1;

        // Subtle grid on floor
        ctx.fillStyle = '#0a120a';
        ctx.fillRect(0, groundY, width, height - groundY);
        ctx.strokeStyle = 'rgba(0,255,65,0.06)';
        ctx.lineWidth = 1;
        const gridP = cameraX * 0.01;
        for (let gx = -1; gx < width / 60 + 2; gx++) {
          const x = gx * 60 - (gridP % 60);
          ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let gy = groundY; gy < height; gy += 60) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
        }

        // Green edge glow
        ctx.fillStyle = 'rgba(0,255,65,0.03)';
        ctx.fillRect(0, groundY, width, 3);

        // Heavy vignette
        const vig = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 600);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);
      } else {
        // White construct (Neo's version) - bright void
        const bgG = ctx.createLinearGradient(0, 0, 0, height);
        bgG.addColorStop(0, '#e8e8e0');
        bgG.addColorStop(0.5, '#f0f0e8');
        bgG.addColorStop(1, '#d8d8d0');
        ctx.fillStyle = bgG;
        ctx.fillRect(0, 0, width, height);

        // Grid lines (very subtle)
        ctx.strokeStyle = 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 1;
        const gridP = cameraX * 0.01;
        for (let gx = -1; gx < width / 80 + 2; gx++) {
          const x = gx * 80 - (gridP % 80);
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let gy = 0; gy < height; gy += 80) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
        }

        // Floor plane (slightly darker)
        ctx.fillStyle = '#d0d0c8';
        ctx.fillRect(0, groundY, width, height - groundY);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, groundY, width, 2);

        // Floor grid (stronger)
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        for (let gx = -1; gx < width / 80 + 2; gx++) {
          const x = gx * 80 - (gridP % 80);
          ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, height); ctx.stroke();
        }

        // Dramatic spotlight
        const spot = ctx.createRadialGradient(width / 2, groundY - 100, 30, width / 2, groundY - 100, 400);
        spot.addColorStop(0, 'rgba(255,255,255,0.15)');
        spot.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);

        // Fade to white at edges (fog effect)
        const fogL = ctx.createLinearGradient(0, 0, 120, 0);
        fogL.addColorStop(0, 'rgba(240,240,232,0.8)');
        fogL.addColorStop(1, 'rgba(240,240,232,0)');
        ctx.fillStyle = fogL;
        ctx.fillRect(0, 0, 120, height);
        const fogR = ctx.createLinearGradient(width, 0, width - 120, 0);
        fogR.addColorStop(0, 'rgba(240,240,232,0.8)');
        fogR.addColorStop(1, 'rgba(240,240,232,0)');
        ctx.fillStyle = fogR;
        ctx.fillRect(width - 120, 0, 120, height);
      }
    },
    bounds: { minX: 150, maxX: 1130 },
    playerStart: { x: 400 },
    enemyStart: { x: 880 },
  };
}
