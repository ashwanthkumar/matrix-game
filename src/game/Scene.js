export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 1280;
    this.height = 720;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Provide renderer.domElement for PostProcessing compatibility
    this.renderer = { domElement: this.canvas };

    // Camera
    this.cameraX = 0;
    this.groundY = 550;

    // Camera shake
    this.cameraShake = { intensity: 0, decay: 0.88 };

    // Drawable entities (characters, etc.)
    this.entities = [];
    this.environment = null;
    this.particleSystem = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const scaleX = window.innerWidth / this.width;
    const scaleY = window.innerHeight / this.height;
    const scale = Math.min(scaleX, scaleY);
    this.canvas.style.width = `${this.width * scale}px`;
    this.canvas.style.height = `${this.height * scale}px`;
    this.canvas.style.left = `${(window.innerWidth - this.width * scale) / 2}px`;
    this.canvas.style.top = `${(window.innerHeight - this.height * scale) / 2}px`;
    this.canvas.style.position = 'fixed';
  }

  shake(intensity = 0.3) {
    this.cameraShake.intensity = intensity * 20;
  }

  updateCamera(playerPos, enemyPos) {
    if (!playerPos) return;
    const px = playerPos.x;
    const ex = enemyPos ? enemyPos.x : px;
    const midX = (px + ex) / 2;
    const targetCamX = midX - this.width / 2;

    // Clamp to environment bounds if available
    if (this.environment && this.environment.bounds) {
      const b = this.environment.bounds;
      const minCam = b.minX - 150;
      const maxCam = b.maxX - this.width + 150;
      const clamped = Math.max(minCam, Math.min(maxCam, targetCamX));
      this.cameraX += (clamped - this.cameraX) * 0.08;
    } else {
      this.cameraX += (targetCamX - this.cameraX) * 0.08;
    }

    // Shake decay
    this.cameraShake.intensity *= this.cameraShake.decay;
    if (this.cameraShake.intensity < 0.5) this.cameraShake.intensity = 0;
  }

  setEnvironment(env) {
    this.environment = env;
  }

  addEntity(entity) {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity);
    }
  }

  removeEntity(entity) {
    this.entities = this.entities.filter(e => e !== entity);
  }

  clearEnvironment() {
    this.environment = null;
    this.entities = [];
  }

  // No-op for 3D API compatibility
  setLighting() {}

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // Apply camera shake
    const shakeX = (Math.random() - 0.5) * this.cameraShake.intensity;
    const shakeY = (Math.random() - 0.5) * this.cameraShake.intensity;
    ctx.translate(Math.round(shakeX), Math.round(shakeY));

    // Draw environment background (handles its own parallax)
    if (this.environment && this.environment.draw) {
      this.environment.draw(ctx, this.width, this.height, this.cameraX, this.groundY);
    } else {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, this.width, this.height);
      // Default ground
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    }

    // Draw entities in world space
    ctx.save();
    ctx.translate(-Math.round(this.cameraX), 0);

    for (const entity of this.entities) {
      if (entity.draw) {
        entity.draw(ctx, this.groundY);
      }
    }

    // Draw particles in world space
    if (this.particleSystem) {
      this.particleSystem.draw(ctx);
    }

    ctx.restore();
    ctx.restore();
  }
}
