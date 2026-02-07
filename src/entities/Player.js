import { Character } from './Character.js';
import { MOVES, DODGE } from '../combat/MoveSet.js';
import { input } from '../utils/Input.js';

export class Player extends Character {
  constructor(type = 'neo') {
    super(type);
    this.energy = 0;
  }

  handleInput(dt) {
    if (this.isDead) return null;

    // Dodge (Space)
    if (input.justPressed(' ') && !this.isDodging && this.dodgeCooldown <= 0) {
      if (this.energy >= DODGE.energyCost) {
        const dir = input.moveLeft ? -1 : input.moveRight ? 1 : (this.facingRight ? 1 : -1);
        if (this.startDodge(dir)) {
          this.energy -= DODGE.energyCost;
          return { action: 'dodge', direction: dir };
        }
      }
    }

    // Block (I)
    if (input.isPressed('i') && !this.isAttacking && !this.isDodging && !this.isHitstunned) {
      this.isBlocking = true;
    } else {
      this.isBlocking = false;
    }

    // Attacks
    if (!this.isAttacking && !this.isHitstunned && !this.isDodging && !this.isBlocking) {
      if (input.justPressed('j')) {
        if (this.startAttack(MOVES.lightPunch)) {
          return { action: 'attack', move: MOVES.lightPunch, key: 'j' };
        }
      }
      if (input.justPressed('k')) {
        if (this.startAttack(MOVES.heavyKick)) {
          return { action: 'attack', move: MOVES.heavyKick, key: 'k' };
        }
      }
      if (input.justPressed('l')) {
        if (this.energy >= MOVES.special.energyCost) {
          if (this.startAttack(MOVES.special)) {
            return { action: 'attack', move: MOVES.special, key: 'l' };
          }
        }
      }
    }

    // Movement (2D: left/right only)
    if (!this.isAttacking && !this.isHitstunned && !this.isDodging) {
      const speed = this.isBlocking ? this.moveSpeed * 0.3 : this.moveSpeed;
      if (input.moveLeft) {
        this.velocity.x = -speed;
      } else if (input.moveRight) {
        this.velocity.x = speed;
      }
    }

    return null;
  }

  update(dt) {
    super.update(dt);
  }
}
