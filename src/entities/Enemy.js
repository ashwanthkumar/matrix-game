import { Character } from './Character.js';
import { MOVES } from '../combat/MoveSet.js';

export class Enemy extends Character {
  constructor(type = 'smith', config = {}) {
    super(type);

    this.aiConfig = {
      attackInterval: config.attackInterval || 2.0,
      attackVariance: config.attackVariance || 1.0,
      blockChance: config.blockChance || 0.1,
      comboChance: config.comboChance || 0,
      specialChance: config.specialChance || 0,
      aggressiveness: config.aggressiveness || 0.3,
      dodgeChance: config.dodgeChance || 0,
      preferredRange: config.preferredRange || 120,
      name: config.name || 'AGENT SMITH',
    };

    this.attackCooldown = this.getNextAttackTime();
    this.decisionTimer = 0;
    this.currentDecision = 'idle';
    this.comboQueue = [];

    this.isBoss = config.isBoss || false;
  }

  getNextAttackTime() {
    return this.aiConfig.attackInterval + (Math.random() - 0.5) * this.aiConfig.attackVariance;
  }

  updateAI(dt, playerPos) {
    if (this.isDead || this.isHitstunned) return null;

    const myPos = this.getPosition();
    const dx = playerPos.x - myPos.x;
    const distance = Math.abs(dx);
    const dirToPlayer = dx > 0 ? 1 : -1;

    this.updateFacing(playerPos.x);

    // Decision timer
    this.decisionTimer -= dt;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = 0.3 + Math.random() * 0.5;
      this.makeDecision(distance);
    }

    this.executeDecision(dt, distance, dirToPlayer);

    // Attack cooldown
    this.attackCooldown -= dt;

    // Process combo queue
    if (this.comboQueue.length > 0 && !this.isAttacking && !this.isHitstunned) {
      const nextMove = this.comboQueue.shift();
      if (this.startAttack(nextMove.move)) {
        return { action: 'attack', move: nextMove.move, key: nextMove.key };
      }
    }

    // Try to attack
    if (this.attackCooldown <= 0 && !this.isAttacking && !this.isBlocking && !this.isDodging) {
      if (distance <= this.aiConfig.preferredRange + 40) {
        const result = this.chooseAttack();
        if (result) {
          this.attackCooldown = this.getNextAttackTime();
          return result;
        }
      }
    }

    return null;
  }

  makeDecision(distance) {
    if (Math.random() < this.aiConfig.blockChance && distance < 150) {
      this.currentDecision = 'block';
      return;
    }

    if (distance > this.aiConfig.preferredRange + 60) {
      this.currentDecision = 'approach';
    } else if (distance < this.aiConfig.preferredRange - 30) {
      this.currentDecision = 'retreat';
    } else {
      this.currentDecision = Math.random() < this.aiConfig.aggressiveness ? 'approach' : 'idle';
    }
  }

  executeDecision(dt, distance, dirToPlayer) {
    if (this.isAttacking || this.isHitstunned || this.isDodging) {
      this.isBlocking = false;
      return;
    }

    switch (this.currentDecision) {
      case 'approach':
        this.isBlocking = false;
        this.velocity.x = dirToPlayer * this.moveSpeed * 0.6;
        break;
      case 'retreat':
        this.isBlocking = false;
        this.velocity.x = -dirToPlayer * this.moveSpeed * 0.4;
        break;
      case 'block':
        this.isBlocking = true;
        break;
      default:
        this.isBlocking = false;
        break;
    }
  }

  chooseAttack() {
    if (Math.random() < this.aiConfig.specialChance && this.energy >= MOVES.special.energyCost) {
      if (this.startAttack(MOVES.special)) {
        return { action: 'attack', move: MOVES.special, key: 'l' };
      }
    }

    if (Math.random() < this.aiConfig.comboChance) {
      if (this.startAttack(MOVES.lightPunch)) {
        this.comboQueue = [
          { move: MOVES.lightPunch, key: 'j' },
          { move: MOVES.heavyKick, key: 'k' },
        ];
        return { action: 'attack', move: MOVES.lightPunch, key: 'j' };
      }
    }

    if (Math.random() > 0.4) {
      if (this.startAttack(MOVES.lightPunch)) {
        return { action: 'attack', move: MOVES.lightPunch, key: 'j' };
      }
    } else {
      if (this.startAttack(MOVES.heavyKick)) {
        return { action: 'attack', move: MOVES.heavyKick, key: 'k' };
      }
    }

    return null;
  }

  tryDodge() {
    if (Math.random() < this.aiConfig.dodgeChance && !this.isDodging && this.dodgeCooldown <= 0) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      return this.startDodge(dir);
    }
    return false;
  }

  update(dt) {
    super.update(dt);
  }
}

export const AI_PRESETS = {
  tutorial: {
    attackInterval: 3.0, attackVariance: 1.0, blockChance: 0.05,
    comboChance: 0, specialChance: 0, aggressiveness: 0.2,
    dodgeChance: 0, preferredRange: 120,
  },
  easy: {
    attackInterval: 2.5, attackVariance: 1.0, blockChance: 0.1,
    comboChance: 0, specialChance: 0, aggressiveness: 0.3,
    dodgeChance: 0, preferredRange: 120,
  },
  medium: {
    attackInterval: 1.5, attackVariance: 0.5, blockChance: 0.25,
    comboChance: 0.2, specialChance: 0.1, aggressiveness: 0.5,
    dodgeChance: 0.1, preferredRange: 110,
  },
  hard: {
    attackInterval: 0.8, attackVariance: 0.3, blockChance: 0.4,
    comboChance: 0.35, specialChance: 0.2, aggressiveness: 0.6,
    dodgeChance: 0.2, preferredRange: 100,
  },
  boss: {
    attackInterval: 0.6, attackVariance: 0.2, blockChance: 0.5,
    comboChance: 0.4, specialChance: 0.3, aggressiveness: 0.7,
    dodgeChance: 0.3, preferredRange: 100, isBoss: true,
  },
};
