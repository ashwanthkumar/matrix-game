export function buildPark() {
  return {
    draw(ctx, width, height, cameraX, groundY) {
      // Night sky
      const skyG = ctx.createLinearGradient(0, 0, 0, groundY);
      skyG.addColorStop(0, '#040808');
      skyG.addColorStop(0.7, '#081410');
      skyG.addColorStop(1, '#0c1a10');
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, width, groundY);

      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5 + cameraX * 0.01) % width;
        const sy = (i * 87.3) % (groundY * 0.4);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(i * 3.1) * 0.15})`;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Distant trees (parallax 0.08)
      const treeP = cameraX * 0.08;
      for (let i = 0; i < 12; i++) {
        const tx = i * 120 + 30 - treeP;
        if (tx < -60 || tx > width + 60) continue;
        const th = 120 + Math.sin(i * 4.3) * 40;
        // Trunk
        ctx.fillStyle = '#1a120a';
        ctx.fillRect(tx - 4, groundY - th + 40, 8, th - 40);
        // Canopy
        ctx.fillStyle = '#0a2a0a';
        ctx.beginPath();
        ctx.arc(tx, groundY - th + 30, 35 + Math.sin(i) * 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0c320c';
        ctx.beginPath();
        ctx.arc(tx + 8, groundY - th + 22, 28 + Math.sin(i * 2) * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Closer trees (parallax 0.04)
      const tree2P = cameraX * 0.04;
      for (const tpos of [80, 500, 1100]) {
        const tx = tpos - tree2P;
        ctx.fillStyle = '#12080a';
        ctx.fillRect(tx - 6, groundY - 160, 12, 160);
        ctx.fillStyle = '#0a3a0a';
        ctx.beginPath();
        ctx.arc(tx, groundY - 170, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0c4a0c';
        ctx.beginPath();
        ctx.arc(tx + 12, groundY - 185, 38, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lamp posts
      const lampP = cameraX * 0.03;
      for (const lx of [300, 700, 1000]) {
        const lampX = lx - lampP;
        ctx.fillStyle = '#333';
        ctx.fillRect(lampX - 3, groundY - 140, 6, 140);
        ctx.fillRect(lampX - 10, groundY - 144, 20, 6);
        // Lamp glow
        const glow = ctx.createRadialGradient(lampX, groundY - 144, 5, lampX, groundY - 144, 80);
        glow.addColorStop(0, 'rgba(255,220,120,0.12)');
        glow.addColorStop(1, 'rgba(255,220,120,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(lampX - 80, groundY - 200, 160, 120);
        ctx.fillStyle = '#ffdd88';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(lampX - 4, groundY - 148, 8, 4);
        ctx.globalAlpha = 1;
      }

      // Bench
      const benchX = 600 - cameraX * 0.03;
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(benchX, groundY - 35, 70, 8);
      ctx.fillRect(benchX + 5, groundY - 27, 6, 27);
      ctx.fillRect(benchX + 59, groundY - 27, 6, 27);
      ctx.fillRect(benchX - 2, groundY - 55, 4, 28);
      ctx.fillRect(benchX + 68, groundY - 55, 4, 28);

      // Ground (grass)
      const grassG = ctx.createLinearGradient(0, groundY, 0, height);
      grassG.addColorStop(0, '#1a3a1a');
      grassG.addColorStop(0.1, '#142e14');
      grassG.addColorStop(1, '#0a1a0a');
      ctx.fillStyle = grassG;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Path (gravel)
      ctx.fillStyle = '#2a2820';
      ctx.fillRect(0, groundY, width, 10);

      // Vignette
      const vig = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 700);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    },
    bounds: { minX: 80, maxX: 1200 },
    playerStart: { x: 400 },
    enemyStart: { x: 880 },
  };
}
