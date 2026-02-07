export function buildDojo() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Back wall
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(0, 0, width, groundY);

      // Rice-paper panels
      const panelW = 160;
      const panelParallax = cameraX * 0.15;
      for (let i = -1; i < 10; i++) {
        const px = i * panelW + 40 - panelParallax;
        if (px + panelW < 0 || px > width) continue;
        ctx.fillStyle = '#3d2410';
        ctx.fillRect(px, 80, panelW, groundY - 120);
        const grad = ctx.createLinearGradient(px, 80, px, groundY - 40);
        grad.addColorStop(0, '#d4c4a0');
        grad.addColorStop(0.5, '#e8d8b0');
        grad.addColorStop(1, '#c4a870');
        ctx.fillStyle = grad;
        ctx.fillRect(px + 8, 88, panelW - 16, groundY - 136);
        // Shoji grid
        ctx.fillStyle = '#3d2410';
        ctx.fillRect(px + 8, (80 + groundY - 40) / 2 - 2, panelW - 16, 4);
        ctx.fillRect(px + panelW / 2 - 2, 88, 4, groundY - 136);
      }

      // Ceiling beam
      ctx.fillStyle = '#1e1008';
      ctx.fillRect(0, 50, width, 16);
      ctx.fillStyle = '#3d2410';
      ctx.fillRect(0, 50, width, 4);

      // Vertical beams
      const beamParallax = cameraX * 0.1;
      for (let i = -1; i < 9; i++) {
        const bx = i * 180 + 20 - beamParallax;
        ctx.fillStyle = '#2a1508';
        ctx.fillRect(bx, 50, 24, 18);
      }

      // Wooden pillars
      const pillarParallax = cameraX * 0.05;
      for (const baseX of [80, 360, 640, 920, 1200]) {
        const px = baseX - pillarParallax;
        if (px < -40 || px > width + 40) continue;
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(px - 8, 55, 28, groundY - 45);
        const pGrad = ctx.createLinearGradient(px - 14, 0, px + 14, 0);
        pGrad.addColorStop(0, '#3d2410');
        pGrad.addColorStop(0.4, '#5a3820');
        pGrad.addColorStop(1, '#2a1508');
        ctx.fillStyle = pGrad;
        ctx.fillRect(px - 14, 55, 28, groundY - 45);
        ctx.fillStyle = '#1e1008';
        ctx.fillRect(px - 20, groundY - 10, 40, 14);
      }

      // Weapon rack
      const rackX = 950 - cameraX * 0.15;
      ctx.fillStyle = '#2a1508';
      ctx.fillRect(rackX, 140, 120, 8);
      ctx.fillRect(rackX, 210, 120, 8);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rackX + 15, 158); ctx.lineTo(rackX + 105, 162); ctx.stroke();
      ctx.strokeStyle = '#5a3820';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(rackX + 10, 198); ctx.lineTo(rackX + 110, 198); ctx.stroke();

      // Hanging lanterns
      for (const lx of [250, 640, 1030]) {
        const lanternX = lx - cameraX * 0.08;
        ctx.strokeStyle = '#3d2410';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lanternX, 50); ctx.lineTo(lanternX, 105); ctx.stroke();
        const glowGrad = ctx.createRadialGradient(lanternX, 120, 5, lanternX, 120, 80);
        glowGrad.addColorStop(0, 'rgba(255,180,60,0.15)');
        glowGrad.addColorStop(1, 'rgba(255,180,60,0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(lanternX - 80, 60, 160, 120);
        ctx.fillStyle = '#cc6620';
        ctx.fillRect(lanternX - 10, 105, 20, 30);
        ctx.fillStyle = 'rgba(255,200,100,0.4)';
        ctx.fillRect(lanternX - 8, 107, 16, 26);
      }

      // Wooden floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, height);
      floorGrad.addColorStop(0, '#5a3820');
      floorGrad.addColorStop(0.1, '#4a2c16');
      floorGrad.addColorStop(1, '#2a1508');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      const plankP = cameraX * 0.02;
      for (let i = -1; i < 20; i++) {
        const plankX = i * 80 - (plankP % 80);
        ctx.beginPath(); ctx.moveTo(plankX, groundY); ctx.lineTo(plankX, height); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,200,120,0.12)';
      ctx.fillRect(0, groundY, width, 6);

      // Warm vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 150, maxX: 1130 },
    playerStart: { x: 400 },
    enemyStart: { x: 880 },
  };
}
