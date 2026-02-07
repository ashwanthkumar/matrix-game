import { MOVES, COMBOS, BLOCK, DODGE } from './MoveSet.js';
import { BulletTime } from './BulletTime.js';

export class CombatSystem {
  constructor() {
    this.bulletTime = new BulletTime();
    this.comboTracker = { inputs: [], timer: 0, count: 0, maxCount: 0, displayTimer: 0 };
    this.stats = { damageDealt: 0, combosLanded: 0, startTime: 0 };
  }

  reset() {
    this.comboTracker = { inputs: [], timer: 0, count: 0, maxCount: 0, displayTimer: 0 };
    this.stats = { damageDealt: 0, combosLanded: 0, startTime: Date.now() };
    this.bulletTime.deactivate();
  }

  registerAttack(key) {
    this.comboTracker.inputs.push(key);
    this.comboTracker.timer = 0;
    if (this.comboTracker.inputs.length > 3) this.comboTracker.inputs.shift();
  }

  checkCombo() {
    const inputs = this.comboTracker.inputs;
    for (const combo of Object.values(COMBOS)) {
      const seq = combo.sequence;
      if (inputs.length >= seq.length) {
        const recent = inputs.slice(-seq.length);
        if (recent.every((k, i) => k === seq[i])) {
          this.comboTracker.inputs = [];
          this.comboTracker.count++;
          this.comboTracker.maxCount = Math.max(this.comboTracker.maxCount, this.comboTracker.count);
          this.stats.combosLanded++;
          return combo;
        }
      }
    }
    return null;
  }

  calculateDamage(move, isBlocking, combo = null) {
    let damage = move.damage;
    if (combo) damage += combo.bonusDamage;
    if (isBlocking) {
      damage *= move.breaksBlock ? 0.5 : (1 - BLOCK.damageReduction);
    }
    this.stats.damageDealt += damage;
    return damage;
  }

  checkHit(attacker, defender, move) {
    if (!attacker || !defender) return false;
    const distance = Math.abs(attacker.position.x - defender.position.x);
    return distance <= move.range;
  }

  processAttack(attacker, defender, moveKey) {
    const moveMap = { j: 'lightPunch', k: 'heavyKick', l: 'special' };
    const moveName = moveMap[moveKey];
    if (!moveName) return null;

    const move = MOVES[moveName];
    if (move.energyCost > 0 && attacker.energy < move.energyCost) return null;

    attacker.energy = Math.max(0, attacker.energy - move.energyCost);
    this.registerAttack(moveKey);

    if (!this.checkHit(attacker, defender, move)) {
      return { hit: false, move, whiff: true };
    }

    if (defender.isDodging) {
      return { hit: false, move, dodged: true };
    }

    const isBlocking = defender.isBlocking;
    const combo = this.checkCombo();
    const damage = this.calculateDamage(move, isBlocking, combo);

    const dir = Math.sign(defender.position.x - attacker.position.x) || 1;
    const knockback = move.knockback * (combo ? 1.5 : 1);

    attacker.energy = Math.min(100, attacker.energy + move.energyGain);
    this.comboTracker.count++;
    this.comboTracker.displayTimer = 2;

    return {
      hit: true, move, damage, knockback, knockbackDir: dir,
      isBlocking, combo,
      hitstun: isBlocking ? move.blockstun : move.hitstun,
    };
  }

  update(dt) {
    this.comboTracker.timer += dt;
    if (this.comboTracker.timer > 1.5) this.comboTracker.inputs = [];
    this.comboTracker.displayTimer -= dt;
    if (this.comboTracker.displayTimer <= 0) this.comboTracker.count = 0;
    this.bulletTime.update(dt);
  }

  getComboCount() { return this.comboTracker.count; }
  getComboDisplay() { return this.comboTracker.displayTimer > 0 && this.comboTracker.count >= 2; }

  getStats() {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    return {
      damageDealt: Math.round(this.stats.damageDealt),
      combosLanded: this.stats.combosLanded,
      timeSeconds: Math.round(elapsed),
    };
  }
}
