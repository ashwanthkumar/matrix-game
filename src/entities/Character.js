// ============================================================
// 2D Polygon Character with Skeletal Animation
// ============================================================

const DEG = Math.PI / 180;
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

// --- Body proportions ---
const BODY = {
  headRadius: 13,
  neckLen: 6,
  torsoLen: 44,
  shoulderW: 38,
  waistW: 28,
  upperArmLen: 26,
  upperArmW: 9,
  forearmLen: 24,
  forearmW: 8,
  handR: 5,
  upperLegLen: 32,
  upperLegW: 12,
  lowerLegLen: 30,
  lowerLegW: 10,
  footW: 14,
  footH: 5,
  hipW: 16, // horizontal offset from center to hip joint
  shoulderOffX: 18, // horizontal offset from center to shoulder joint
};

// Total height: footH + lowerLegLen + upperLegLen + torsoLen + neckLen + headRadius*2
// = 5 + 30 + 32 + 44 + 6 + 26 = 143px
const TOTAL_HEIGHT = BODY.footH + BODY.lowerLegLen + BODY.upperLegLen + BODY.torsoLen + BODY.neckLen + BODY.headRadius * 2;
const HIP_Y = -(BODY.footH + BODY.lowerLegLen + BODY.upperLegLen); // -67
const SHOULDER_Y = HIP_Y - BODY.torsoLen; // -111
const HEAD_Y = SHOULDER_Y - BODY.neckLen - BODY.headRadius; // -130

// --- Character visual skins ---
const SKINS = {
  neo: {
    skin: '#E8C49A',
    hair: '#1a1a1a',
    hairStyle: 'slicked',
    outfit: '#111111',
    outfitLight: '#1a1a1a',
    coat: '#080808',
    coatLen: 72,
    boots: '#1a1a1a',
    gloves: '#111111',
    sunglasses: '#0a0a0a',
    sunglassesW: 20,
    sunglassesH: 5,
    outline: '#222222',
  },
  smith: {
    skin: '#E8C49A',
    hair: '#2a2518',
    hairStyle: 'parted',
    shirt: '#cccccc',
    tie: '#771111',
    outfit: '#1a1a2a',
    outfitLight: '#222235',
    jacket: '#181828',
    jacketLen: 24,
    boots: '#0a0a0a',
    sunglasses: '#0a0a0a',
    sunglassesW: 18,
    sunglassesH: 5,
    earpiece: true,
    outline: '#2a2a3a',
  },
  morpheus: {
    skin: '#8B6914',
    hair: null, // bald
    outfit: '#1a0e08',
    outfitLight: '#2a1a10',
    coat: '#120804',
    coatLen: 60,
    boots: '#0a0a0a',
    sunglasses: '#554400',
    sunglassesW: 10,
    sunglassesH: 8,
    sunglassesRound: true,
    outline: '#2a1a0a',
  },
  rebel: {
    skin: '#E8C49A',
    hair: '#443322',
    hairStyle: 'messy',
    outfit: '#3a3a2a',
    outfitLight: '#4a4a38',
    boots: '#2a2a1a',
    outline: '#444433',
  },
};

// --- Animation Poses (joint angles in degrees) ---
// Positive = forward (toward facing direction)
// Convention: arms/legs hang down at 0. Positive rotates toward facing direction.
const POSES = {
  idle: {
    torso: 2,
    head: 0,
    rShoulder: 55, rElbow: -100,
    lShoulder: 45, lElbow: -90,
    rHip: 3, rKnee: -5,
    lHip: -3, lKnee: 5,
    coatSwing: 0,
  },
  walk1: {
    torso: 3,
    head: 0,
    rShoulder: -15, rElbow: -30,
    lShoulder: 20, lElbow: -25,
    rHip: 25, rKnee: -10,
    lHip: -25, lKnee: 30,
    coatSwing: 5,
  },
  walk2: {
    torso: 3,
    head: 0,
    rShoulder: 20, rElbow: -25,
    lShoulder: -15, lElbow: -30,
    rHip: -25, rKnee: 30,
    lHip: 25, lKnee: -10,
    coatSwing: -5,
  },
  punch: {
    torso: -8,
    head: -2,
    rShoulder: -90, rElbow: -5,
    lShoulder: 40, lElbow: -80,
    rHip: 5, rKnee: -5,
    lHip: -5, lKnee: 5,
    coatSwing: 15,
  },
  kick: {
    torso: -10,
    head: -5,
    rShoulder: 30, rElbow: -60,
    lShoulder: 60, lElbow: -70,
    rHip: -90, rKnee: -10,
    lHip: -10, lKnee: 10,
    coatSwing: 20,
  },
  special: {
    torso: -15,
    head: -5,
    rShoulder: -85, rElbow: -10,
    lShoulder: -80, lElbow: -5,
    rHip: 10, rKnee: -10,
    lHip: -5, lKnee: 5,
    coatSwing: 25,
  },
  block: {
    torso: -5,
    head: -3,
    rShoulder: 70, rElbow: -120,
    lShoulder: 65, lElbow: -115,
    rHip: 0, rKnee: 5,
    lHip: 0, lKnee: 5,
    coatSwing: 3,
  },
  dodge: {
    torso: -25,
    head: -15,
    rShoulder: -10, rElbow: -20,
    lShoulder: -15, lElbow: -25,
    rHip: -10, rKnee: 15,
    lHip: 10, lKnee: -5,
    coatSwing: 20,
  },
  hit: {
    torso: -15,
    head: -10,
    rShoulder: -20, rElbow: -15,
    lShoulder: -25, lElbow: -20,
    rHip: -5, rKnee: 10,
    lHip: 5, lKnee: -3,
    coatSwing: 10,
  },
  dead: {
    torso: -80,
    head: -30,
    rShoulder: -40, rElbow: -10,
    lShoulder: -45, lElbow: -15,
    rHip: 20, rKnee: -30,
    lHip: 30, lKnee: -20,
    coatSwing: 30,
  },
};

function lerpPose(a, b, t) {
  const result = {};
  for (const key in a) {
    result[key] = lerp(a[key], b[key] !== undefined ? b[key] : a[key], t);
  }
  return result;
}

// --- Drawing helpers ---

function drawLimb(ctx, width, length, color, outlineColor) {
  const r = Math.min(width / 2, 3);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-width / 2 + r, 0);
  ctx.lineTo(width / 2 - r, 0);
  ctx.quadraticCurveTo(width / 2, 0, width / 2, r);
  ctx.lineTo(width / 2, length - r);
  ctx.quadraticCurveTo(width / 2, length, width / 2 - r, length);
  ctx.lineTo(-width / 2 + r, length);
  ctx.quadraticCurveTo(-width / 2, length, -width / 2, length - r);
  ctx.lineTo(-width / 2, r);
  ctx.quadraticCurveTo(-width / 2, 0, -width / 2 + r, 0);
  ctx.closePath();
  ctx.fill();
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawTorso(ctx, shoulderW, waistW, length, color, outlineColor) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-shoulderW / 2, 0);
  ctx.lineTo(shoulderW / 2, 0);
  ctx.lineTo(waistW / 2, length);
  ctx.lineTo(-waistW / 2, length);
  ctx.closePath();
  ctx.fill();
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawHead(ctx, radius, skin) {
  // Face
  ctx.fillStyle = skin.skin;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = skin.outline || '#333';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Hair
  if (skin.hairStyle === 'slicked') {
    ctx.fillStyle = skin.hair;
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI, 0);
    ctx.lineTo(radius + 2, -2);
    ctx.lineTo(-radius - 2, -2);
    ctx.closePath();
    ctx.fill();
  } else if (skin.hairStyle === 'parted') {
    ctx.fillStyle = skin.hair;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 1, Math.PI + 0.3, -0.1);
    ctx.lineTo(radius, -1);
    ctx.lineTo(-radius, 0);
    ctx.closePath();
    ctx.fill();
  } else if (skin.hairStyle === 'messy') {
    ctx.fillStyle = skin.hair;
    ctx.beginPath();
    ctx.arc(0, -2, radius + 2, Math.PI, 0);
    // Spiky top
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI + (i / 4) * Math.PI;
      const spike = radius + 4 + (i % 2) * 3;
      ctx.lineTo(Math.cos(angle) * spike, Math.sin(angle) * spike - 2);
    }
    ctx.closePath();
    ctx.fill();
  }
  // Bald: no hair drawn (morpheus)

  // Sunglasses
  if (skin.sunglasses) {
    const sw = skin.sunglassesW || 18;
    const sh = skin.sunglassesH || 5;
    if (skin.sunglassesRound) {
      // Round glasses (Morpheus)
      ctx.fillStyle = skin.sunglasses;
      ctx.beginPath();
      ctx.arc(-5, 0, sh, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, 0, sh, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5 + sh, 0);
      ctx.lineTo(5 - sh, 0);
      ctx.stroke();
    } else {
      // Rectangular glasses (Neo, Smith)
      ctx.fillStyle = skin.sunglasses;
      const x = -sw / 2;
      const y = -sh / 2;
      ctx.fillRect(x, y, sw, sh);
      // Slight glare
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x + 2, y + 1, sw / 3, sh / 2);
    }
  }

  // Earpiece (Smith)
  if (skin.earpiece) {
    ctx.fillStyle = '#333';
    ctx.fillRect(radius - 1, -2, 4, 6);
    ctx.fillRect(radius + 1, 4, 2, 5);
  }
}

function drawCoat(ctx, shoulderY, torsoLen, shoulderW, coatLen, color, swingAngle) {
  const sw = shoulderW / 2 + 6;
  const midW = shoulderW / 2 + 3;
  const botW = shoulderW / 2 + 10;
  const botY = shoulderY + torsoLen + coatLen;
  const swing = swingAngle * DEG;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY);
  ctx.lineTo(sw, shoulderY);
  ctx.lineTo(midW + 2, shoulderY + torsoLen);
  ctx.lineTo(botW + Math.sin(swing) * 8, botY);
  ctx.quadraticCurveTo(0, botY + 4, -botW + Math.sin(swing) * 5, botY);
  ctx.lineTo(-midW - 2, shoulderY + torsoLen);
  ctx.closePath();
  ctx.fill();

  // Coat edge highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawJacket(ctx, shoulderY, torsoLen, shoulderW, jacketLen, color) {
  const sw = shoulderW / 2 + 4;
  const botW = shoulderW / 2;
  const botY = shoulderY + torsoLen + jacketLen;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY);
  ctx.lineTo(sw, shoulderY);
  ctx.lineTo(botW, botY);
  ctx.lineTo(-botW, botY);
  ctx.closePath();
  ctx.fill();

  // Lapels
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3, shoulderY);
  ctx.lineTo(-6, shoulderY + 20);
  ctx.moveTo(3, shoulderY);
  ctx.lineTo(6, shoulderY + 20);
  ctx.stroke();
}

function drawTie(ctx, shoulderY) {
  ctx.fillStyle = '#771111';
  ctx.beginPath();
  ctx.moveTo(-3, shoulderY + 2);
  ctx.lineTo(3, shoulderY + 2);
  ctx.lineTo(2, shoulderY + 30);
  ctx.lineTo(0, shoulderY + 34);
  ctx.lineTo(-2, shoulderY + 30);
  ctx.closePath();
  ctx.fill();
}

function drawShirtCollar(ctx, shoulderY) {
  ctx.fillStyle = '#cccccc';
  ctx.beginPath();
  ctx.moveTo(-8, shoulderY);
  ctx.lineTo(-3, shoulderY + 8);
  ctx.lineTo(0, shoulderY + 3);
  ctx.lineTo(3, shoulderY + 8);
  ctx.lineTo(8, shoulderY);
  ctx.closePath();
  ctx.fill();
}

// --- Main character drawing ---

function drawCharacterBody(ctx, joints, skin, opacity) {
  if (opacity !== undefined && opacity < 1) {
    ctx.globalAlpha = opacity;
  }

  const sY = SHOULDER_Y; // shoulder Y
  const hY = HIP_Y;      // hip Y
  const outline = skin.outline;

  // --- Shadow on ground ---
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Back arm (left arm) ---
  ctx.save();
  ctx.translate(-BODY.shoulderOffX, sY);
  ctx.rotate(joints.lShoulder * DEG);
  drawLimb(ctx, BODY.upperArmW - 1, BODY.upperArmLen, skin.outfitLight || skin.outfit, outline);
  ctx.translate(0, BODY.upperArmLen);
  ctx.rotate(joints.lElbow * DEG);
  drawLimb(ctx, BODY.forearmW - 1, BODY.forearmLen, skin.outfitLight || skin.outfit, outline);
  // Hand
  ctx.translate(0, BODY.forearmLen);
  ctx.fillStyle = skin.gloves || skin.skin;
  ctx.beginPath();
  ctx.arc(0, BODY.handR, BODY.handR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Back leg (left leg) ---
  ctx.save();
  ctx.translate(-BODY.hipW / 2, hY);
  ctx.rotate(joints.lHip * DEG);
  drawLimb(ctx, BODY.upperLegW, BODY.upperLegLen, skin.outfit, outline);
  ctx.translate(0, BODY.upperLegLen);
  ctx.rotate(joints.lKnee * DEG);
  drawLimb(ctx, BODY.lowerLegW, BODY.lowerLegLen, skin.outfit, outline);
  ctx.translate(0, BODY.lowerLegLen);
  // Foot
  ctx.fillStyle = skin.boots || skin.outfit;
  ctx.fillRect(-3, 0, BODY.footW, BODY.footH);
  ctx.restore();

  // --- Coat back panel (behind torso) ---
  if (skin.coat) {
    drawCoat(ctx, sY, BODY.torsoLen, BODY.shoulderW, skin.coatLen, skin.coat, joints.coatSwing || 0);
  }
  if (skin.jacket) {
    drawJacket(ctx, sY, BODY.torsoLen, BODY.shoulderW, skin.jacketLen, skin.jacket);
  }

  // --- Torso ---
  ctx.save();
  ctx.translate(0, sY);
  drawTorso(ctx, BODY.shoulderW, BODY.waistW, BODY.torsoLen, skin.outfit, outline);

  // Smith: shirt collar and tie
  if (skin.shirt) {
    drawShirtCollar(ctx, 0);
  }
  if (skin.tie) {
    drawTie(ctx, 0);
  }
  ctx.restore();

  // --- Front leg (right leg) ---
  ctx.save();
  ctx.translate(BODY.hipW / 2, hY);
  ctx.rotate(joints.rHip * DEG);
  drawLimb(ctx, BODY.upperLegW, BODY.upperLegLen, skin.outfit, outline);
  ctx.translate(0, BODY.upperLegLen);
  ctx.rotate(joints.rKnee * DEG);
  drawLimb(ctx, BODY.lowerLegW, BODY.lowerLegLen, skin.outfit, outline);
  ctx.translate(0, BODY.lowerLegLen);
  // Foot
  ctx.fillStyle = skin.boots || skin.outfit;
  ctx.fillRect(-3, 0, BODY.footW, BODY.footH);
  ctx.restore();

  // --- Front arm (right arm) ---
  ctx.save();
  ctx.translate(BODY.shoulderOffX, sY);
  ctx.rotate(joints.rShoulder * DEG);
  drawLimb(ctx, BODY.upperArmW, BODY.upperArmLen, skin.outfit, outline);
  ctx.translate(0, BODY.upperArmLen);
  ctx.rotate(joints.rElbow * DEG);
  drawLimb(ctx, BODY.forearmW, BODY.forearmLen, skin.outfit, outline);
  // Hand / fist
  ctx.translate(0, BODY.forearmLen);
  ctx.fillStyle = skin.gloves || skin.skin;
  ctx.beginPath();
  ctx.arc(0, BODY.handR, BODY.handR + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Neck ---
  ctx.fillStyle = skin.skin;
  ctx.fillRect(-4, sY - BODY.neckLen, 8, BODY.neckLen);

  // --- Head ---
  ctx.save();
  ctx.translate(0, HEAD_Y);
  ctx.rotate(joints.head * DEG);
  drawHead(ctx, BODY.headRadius, skin);
  ctx.restore();

  ctx.globalAlpha = 1;
}


// ============================================================
// Character class (game logic + rendering)
// ============================================================

export class Character {
  constructor(type = 'neo') {
    this.type = type;
    this.skin = SKINS[type] || SKINS.neo;

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.energy = 0;
    this.maxEnergy = 100;

    // State
    this.isAttacking = false;
    this.isBlocking = false;
    this.isDodging = false;
    this.isHitstunned = false;
    this.isDead = false;
    this.facingRight = true;

    // Timers
    this.attackTimer = 0;
    this.attackPhase = null;
    this.currentMove = null;
    this.hitstunTimer = 0;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 0;
    this.invincible = false;

    // Animation
    this.joints = { ...POSES.idle };
    this.targetPose = POSES.idle;
    this.animTimer = 0;
    this.walkCycle = 0;
    this.lerpSpeed = 10;

    // Movement (2D: x only)
    this.position = { x: 0 };
    this.velocity = { x: 0 };
    this.moveSpeed = 300; // pixels/sec

    // Arena bounds (2D: x only)
    this.bounds = { minX: 100, maxX: 1180 };
  }

  getPosition() {
    return this.position;
  }

  setPosition(x) {
    this.position.x = x;
  }

  takeDamage(amount, knockback = 0, knockbackDir = 1, hitstun = 0.3) {
    if (this.isDead || this.invincible) return;

    this.health = Math.max(0, this.health - amount);

    // Apply knockback (in pixels)
    this.position.x += knockback * knockbackDir;
    this.position.x = clamp(this.position.x, this.bounds.minX, this.bounds.maxX);

    // Apply hitstun
    if (hitstun > 0 && !this.isBlocking) {
      this.isHitstunned = true;
      this.hitstunTimer = hitstun;
      this.isAttacking = false;
      this.attackPhase = null;
      this.currentMove = null;
    }

    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  startAttack(move) {
    if (this.isAttacking || this.isHitstunned || this.isDodging || this.isDead) return false;
    this.isAttacking = true;
    this.attackPhase = 'startup';
    this.attackTimer = 0;
    this.currentMove = move;
    this.isBlocking = false;
    return true;
  }

  startDodge(direction = 0) {
    if (this.isDodging || this.dodgeCooldown > 0 || this.isHitstunned || this.isDead) return false;
    this.isDodging = true;
    this.invincible = true;
    this.dodgeTimer = 0.3;
    this.dodgeCooldown = 0.8;
    this.isAttacking = false;
    this.isBlocking = false;
    this.velocity.x = direction * 600;
    return true;
  }

  updateTimers(dt) {
    if (this.isAttacking && this.currentMove) {
      this.attackTimer += dt;
      const move = this.currentMove;
      if (this.attackPhase === 'startup' && this.attackTimer >= move.startup) {
        this.attackPhase = 'active';
        this.attackTimer = 0;
      } else if (this.attackPhase === 'active' && this.attackTimer >= move.active) {
        this.attackPhase = 'recovery';
        this.attackTimer = 0;
      } else if (this.attackPhase === 'recovery' && this.attackTimer >= move.recovery) {
        this.isAttacking = false;
        this.attackPhase = null;
        this.currentMove = null;
        this.attackTimer = 0;
      }
    }

    if (this.isHitstunned) {
      this.hitstunTimer -= dt;
      if (this.hitstunTimer <= 0) this.isHitstunned = false;
    }

    if (this.isDodging) {
      this.dodgeTimer -= dt;
      if (this.dodgeTimer <= 0.1) this.invincible = false;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.velocity.x *= 0.2;
      }
    }

    if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
  }

  getAttackProgress() {
    if (!this.currentMove || !this.attackPhase) return 0;
    const dur = this.currentMove[this.attackPhase];
    return dur > 0 ? this.attackTimer / dur : 0;
  }

  updateAnimation(dt) {
    this.animTimer += dt;
    const t = this.animTimer;

    // Determine target pose
    if (this.isDead) {
      this.targetPose = POSES.dead;
      this.lerpSpeed = 4;
    } else if (this.isHitstunned) {
      // Stagger with oscillation
      const stagger = Math.sin(t * 20) * 5;
      this.targetPose = { ...POSES.hit, torso: POSES.hit.torso + stagger, head: POSES.hit.head - stagger };
      this.lerpSpeed = 12;
    } else if (this.isAttacking && this.currentMove) {
      const anim = this.currentMove.animation;
      const progress = this.getAttackProgress();
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const swing = this.attackPhase === 'startup' ? ease : this.attackPhase === 'active' ? 1 : 1 - ease;

      if (anim.type === 'punch') {
        this.targetPose = lerpPose(POSES.idle, POSES.punch, swing);
      } else if (anim.type === 'kick') {
        this.targetPose = lerpPose(POSES.idle, POSES.kick, swing);
      } else if (anim.type === 'special') {
        this.targetPose = lerpPose(POSES.idle, POSES.special, swing);
      }
      this.lerpSpeed = 20;
    } else if (this.isBlocking) {
      this.targetPose = POSES.block;
      this.lerpSpeed = 15;
    } else if (this.isDodging) {
      this.targetPose = POSES.dodge;
      this.lerpSpeed = 18;
    } else if (Math.abs(this.velocity.x) > 30) {
      // Walking
      this.walkCycle += dt * 6;
      const mix = (Math.sin(this.walkCycle) + 1) / 2;
      this.targetPose = lerpPose(POSES.walk1, POSES.walk2, mix);
      this.lerpSpeed = 10;
    } else {
      // Idle with breathing
      const breath = Math.sin(t * 2) * 2;
      this.targetPose = { ...POSES.idle, torso: POSES.idle.torso + breath };
      this.lerpSpeed = 8;
    }

    // Lerp joints toward target
    for (const key in this.joints) {
      if (this.targetPose[key] !== undefined) {
        this.joints[key] = lerp(this.joints[key], this.targetPose[key], this.lerpSpeed * dt);
      }
    }
  }

  updateFacing(targetX) {
    if (this.isDead) return;
    this.facingRight = targetX > this.position.x;
  }

  update(dt) {
    this.updateTimers(dt);

    // Apply velocity
    this.position.x += this.velocity.x * dt;

    // Clamp to bounds
    this.position.x = clamp(this.position.x, this.bounds.minX, this.bounds.maxX);

    // Damping
    this.velocity.x *= 0.85;

    // Animation
    this.updateAnimation(dt);
  }

  draw(ctx, groundY) {
    ctx.save();
    ctx.translate(this.position.x, groundY);

    // Flip for facing direction
    if (!this.facingRight) {
      ctx.scale(-1, 1);
    }

    // Torso lean rotation applied at hip
    ctx.save();
    ctx.translate(0, HIP_Y);
    ctx.rotate(this.joints.torso * DEG);
    ctx.translate(0, -HIP_Y);

    drawCharacterBody(ctx, this.joints, this.skin,
      this.isDodging ? 0.6 : (this.invincible ? 0.7 + Math.sin(this.animTimer * 30) * 0.3 : 1));

    ctx.restore();

    // Hit flash
    if (this.isHitstunned && Math.sin(this.animTimer * 40) > 0) {
      ctx.save();
      ctx.translate(0, HIP_Y);
      ctx.rotate(this.joints.torso * DEG);
      ctx.translate(0, -HIP_Y);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.3;
      drawCharacterBody(ctx, this.joints, {
        ...this.skin,
        skin: '#ffffff',
        outfit: '#ffffff',
        outfitLight: '#ffffff',
        coat: '#ffffff',
        jacket: '#ffffff',
        boots: '#ffffff',
      });
      ctx.restore();
    }

    ctx.restore();
  }
}
