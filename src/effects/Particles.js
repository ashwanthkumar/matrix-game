class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.gravity = 400;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 10;
  }

  update(dt) {
    this.life -= dt;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotSpeed * dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawnHitParticles(position, count = 8) {
    const cx = position.x;
    const cy = -80; // roughly chest height relative to ground
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 400;
      const vy = -Math.random() * 250 - 50;
      const color = Math.random() > 0.5 ? '#00ff41' : '#ffffff';
      const size = 3 + Math.random() * 5;
      this.particles.push(new Particle(cx, cy, vx, vy, color, size, 0.4 + Math.random() * 0.3));
    }
  }

  spawnBlockParticles(position) {
    const cx = position.x;
    const cy = -80;
    for (let i = 0; i < 5; i++) {
      const vx = (Math.random() - 0.5) * 200;
      const vy = -Math.random() * 150;
      this.particles.push(new Particle(cx, cy, vx, vy, '#4444ff', 4, 0.3));
    }
  }

  spawnDodgeTrail(position, direction) {
    const cx = position.x;
    for (let i = 0; i < 3; i++) {
      const p = new Particle(cx - direction * i * 20, -70, -direction * 30, -20, '#00ff41', 8, 0.4);
      p.gravity = 0;
      this.particles.push(p);
    }
  }

  spawnSpecialParticles(position) {
    const cx = position.x;
    const cy = -80;
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const speed = 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 100;
      this.particles.push(new Particle(cx, cy, vx, vy, '#00ff41', 5, 0.5));
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update(dt)) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Particles are drawn in world space (ctx already has camera transform)
    // But particle y positions are relative to groundY
    // The caller (Scene.js) has already translated to world space
    // We need to account for groundY
    const groundY = 550;
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(0, groundY);
      p.draw(ctx);
      ctx.restore();
    }
    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}
