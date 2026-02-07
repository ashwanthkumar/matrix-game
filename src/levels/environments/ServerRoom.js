export function buildServerRoom() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Dark room
      ctx.fillStyle = '#060a06';
      ctx.fillRect(0, 0, width, height);

      // Ceiling
      ctx.fillStyle = '#0a0e0a';
      ctx.fillRect(0, 0, width, 30);

      // Server racks (parallax 0.06)
      const rackP = cameraX * 0.06;
      for (let i = 0; i < 14; i++) {
        const rx = i * 100 + 30 - rackP;
        if (rx < -50 || rx > width + 50) continue;
        const rackW = 60;
        const rackH = groundY - 50;

        // Rack body
        ctx.fillStyle = '#111816';
        ctx.fillRect(rx, 40, rackW, rackH);
        ctx.fillStyle = '#0a120a';
        ctx.fillRect(rx + 3, 44, rackW - 6, rackH - 8);

        // Server units (horizontal stripes with blinking lights)
        for (let sy = 50; sy < 40 + rackH - 20; sy += 18) {
          // Server unit
          ctx.fillStyle = '#0e160e';
          ctx.fillRect(rx + 6, sy, rackW - 12, 14);
          // Front panel
          ctx.fillStyle = '#111a11';
          ctx.fillRect(rx + 8, sy + 2, rackW - 16, 10);

          // Status LEDs
          const ledSeed = i * 17 + sy;
          const ledColor = Math.sin(ledSeed) > 0 ? '#00ff41' : (Math.sin(ledSeed * 2.7) > 0.5 ? '#ffaa00' : '#00aa22');
          const ledAlpha = 0.4 + Math.sin(Date.now() * 0.003 + ledSeed) * 0.3;
          ctx.fillStyle = ledColor;
          ctx.globalAlpha = ledAlpha;
          ctx.fillRect(rx + rackW - 16, sy + 5, 3, 3);
          if (Math.sin(ledSeed * 3.1) > 0) {
            ctx.fillRect(rx + rackW - 22, sy + 5, 3, 3);
          }
          ctx.globalAlpha = 1;
        }

        // Rack label
        ctx.fillStyle = '#00aa22';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(rx + 10, 46, 20, 3);
        ctx.globalAlpha = 1;
      }

      // Cable runs on ceiling
      ctx.strokeStyle = '#1a2a1a';
      ctx.lineWidth = 3;
      for (let cy = 0; cy < 3; cy++) {
        ctx.beginPath();
        ctx.moveTo(0, 25 + cy * 5);
        ctx.lineTo(width, 25 + cy * 5);
        ctx.stroke();
      }

      // Green glow from servers
      const glow1 = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 400);
      glow1.addColorStop(0, 'rgba(0,255,65,0.04)');
      glow1.addColorStop(1, 'rgba(0,255,65,0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      // Floor (raised floor tiles)
      ctx.fillStyle = '#121a12';
      ctx.fillRect(0, groundY, width, height - groundY);
      const floorP = cameraX * 0.02;
      ctx.strokeStyle = 'rgba(0,60,0,0.2)';
      ctx.lineWidth = 1;
      for (let fx = -1; fx < width / 50 + 2; fx++) {
        const x = fx * 50 - (floorP % 50);
        ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let fy = groundY; fy < height; fy += 50) {
        ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(width, fy); ctx.stroke();
      }

      // Floor LED strip
      ctx.fillStyle = 'rgba(0,255,65,0.06)';
      ctx.fillRect(0, groundY, width, 2);

      // Vignette (heavier for dark atmosphere)
      const vig = ctx.createRadialGradient(width / 2, height / 2, 150, width / 2, height / 2, 650);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 100, maxX: 1180 },
    playerStart: { x: 380 },
    enemyStart: { x: 900 },
  };
}
