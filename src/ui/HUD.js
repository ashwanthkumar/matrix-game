export class HUD {
  constructor() {
    this.el = document.getElementById('hud');
    this.playerHealthFill = document.getElementById('player-health-fill');
    this.playerEnergyFill = document.getElementById('player-energy-fill');
    this.enemyHealthFill = document.getElementById('enemy-health-fill');
    this.enemyNameDisplay = document.getElementById('enemy-name-display');
    this.levelNameEl = document.getElementById('level-name');
    this.levelTitleEl = document.getElementById('level-title');
    this.comboDisplay = document.getElementById('combo-display');
    this.comboCount = document.getElementById('combo-count');
  }

  show() {
    this.el.style.display = 'block';
  }

  hide() {
    this.el.style.display = 'none';
  }

  setLevelInfo(levelNum, title) {
    this.levelNameEl.textContent = `LEVEL ${levelNum}`;
    this.levelTitleEl.textContent = title;
  }

  setEnemyName(name) {
    this.enemyNameDisplay.textContent = name;
  }

  updatePlayerHealth(current, max) {
    const pct = Math.max(0, (current / max) * 100);
    this.playerHealthFill.style.width = `${pct}%`;

    // Change color when low
    if (pct < 25) {
      this.playerHealthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff2222)';
    } else if (pct < 50) {
      this.playerHealthFill.style.background = 'linear-gradient(90deg, #ff4400, #ff6644)';
    } else {
      this.playerHealthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
    }
  }

  updatePlayerEnergy(current, max) {
    const pct = Math.max(0, (current / max) * 100);
    this.playerEnergyFill.style.width = `${pct}%`;
  }

  updateEnemyHealth(current, max) {
    const pct = Math.max(0, (current / max) * 100);
    this.enemyHealthFill.style.width = `${pct}%`;
  }

  updateCombo(count, visible) {
    if (visible && count >= 2) {
      this.comboDisplay.classList.add('visible');
      this.comboCount.textContent = count;
    } else {
      this.comboDisplay.classList.remove('visible');
    }
  }
}
