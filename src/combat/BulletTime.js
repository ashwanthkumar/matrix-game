export class BulletTime {
  constructor() {
    this.active = false;
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.playerTimeScale = 1.0;
    this.enemyTimeScale = 1.0;
    this.energyDrainRate = 20; // energy per second
    this.lerpSpeed = 8;
  }

  activate() {
    if (this.active) return;
    this.active = true;
    this.targetTimeScale = 0.25;
    this.playerTimeScale = 0.75;
    this.enemyTimeScale = 0.25;
  }

  deactivate() {
    this.active = false;
    this.targetTimeScale = 1.0;
    this.playerTimeScale = 1.0;
    this.enemyTimeScale = 1.0;
  }

  update(dt) {
    // Smoothly lerp to target
    this.timeScale += (this.targetTimeScale - this.timeScale) * this.lerpSpeed * dt;
    if (Math.abs(this.timeScale - this.targetTimeScale) < 0.01) {
      this.timeScale = this.targetTimeScale;
    }
  }

  getEnergyDrain(dt) {
    return this.active ? this.energyDrainRate * dt : 0;
  }

  getPlayerDt(dt) {
    return dt * this.playerTimeScale;
  }

  getEnemyDt(dt) {
    return dt * this.enemyTimeScale;
  }

  // Brief slow-mo flash for dodge (auto-deactivates)
  flashSlowMo(duration = 0.3) {
    this.active = true;
    this.targetTimeScale = 0.15;
    this.playerTimeScale = 0.6;
    this.enemyTimeScale = 0.15;
    this.timeScale = 0.15;

    setTimeout(() => {
      this.deactivate();
    }, duration * 1000);
  }
}
