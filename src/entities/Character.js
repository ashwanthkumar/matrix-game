// ============================================================
// Enhanced 2D Character — Anatomical Shapes & Volumetric Shading
// ============================================================

const DEG = Math.PI / 180;
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

// ---- Color utilities for shading ----

function parseHex(hex) {
  if (!hex || hex[0] !== '#' || hex.length < 7) return { r: 20, g: 20, b: 20 };
  return {
    r: parseInt(hex.slice(1, 3), 16) || 0,
    g: parseInt(hex.slice(3, 5), 16) || 0,
    b: parseInt(hex.slice(5, 7), 16) || 0,
  };
}

function shade(hex, amt) {
  const c = parseHex(hex);
  return `rgb(${clamp(c.r + amt, 0, 255)},${clamp(c.g + amt, 0, 255)},${clamp(c.b + amt, 0, 255)})`;
}

function rgba(hex, a) {
  const c = parseHex(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

// Volumetric side-to-side gradient (simulates cylindrical lighting)
// Very high contrast for dark clothing to survive green filter at game scale
function limbGradient(ctx, halfW, baseColor) {
  const g = ctx.createLinearGradient(-halfW - 1, 0, halfW + 1, 0);
  g.addColorStop(0, shade(baseColor, -45));
  g.addColorStop(0.2, shade(baseColor, 22));
  g.addColorStop(0.42, shade(baseColor, 45));
  g.addColorStop(0.6, shade(baseColor, 15));
  g.addColorStop(1, shade(baseColor, -50));
  return g;
}


// ---- Body proportions (anatomically improved) ----

const BODY = {
  headRX: 16,        // head ellipse horizontal radius (big for readability at game scale)
  headRY: 18,        // head ellipse vertical radius
  jawW: 13,          // jaw half-width at widest
  neckLen: 6,
  neckW: 10,
  torsoLen: 46,
  shoulderW: 42,     // wider shoulders for presence
  chestW: 44,        // wider chest
  waistW: 30,
  // Arms — tapered with visible muscle
  upperArmLen: 27,
  upperArmTop: 13,   // width at shoulder (thick for readability)
  upperArmBot: 9,    // width at elbow
  forearmLen: 25,
  forearmTop: 10,    // width at elbow (thick)
  forearmBot: 7,     // width at wrist
  handR: 6,
  // Legs — tapered with pronounced calf
  upperLegLen: 33,
  upperLegTop: 15,   // width at hip (wider)
  upperLegBot: 10,   // width at knee
  lowerLegLen: 31,
  lowerLegTop: 12,   // width at knee (wider)
  lowerLegBot: 7,    // width at ankle
  calfPos: 0.3,      // where calf muscle peaks (0-1)
  calfBulge: 3.5,    // more pronounced calf
  // Feet
  footW: 16,
  footH: 6,
  // Joint offsets
  hipW: 17,
  shoulderOffX: 20,
  shoulderCapR: 7,   // larger deltoid
};

// Total height ≈ 150px (close to original 143)
const TOTAL_HEIGHT = BODY.footH + BODY.lowerLegLen + BODY.upperLegLen + BODY.torsoLen + BODY.neckLen + BODY.headRY * 2;
const HIP_Y = -(BODY.footH + BODY.lowerLegLen + BODY.upperLegLen);
const SHOULDER_Y = HIP_Y - BODY.torsoLen;
const HEAD_Y = SHOULDER_Y - BODY.neckLen - BODY.headRY;


// ---- Character skins (enhanced with shadow variants) ----

const SKINS = {
  neo: {
    skin: '#F0C890',
    skinShadow: '#C89858',
    hair: '#1a1a1a',
    hairStyle: 'slicked',
    outfit: '#141414',
    outfitLight: '#2a2a2a',
    coat: '#080808',
    coatLen: 72,
    boots: '#1a1a1a',
    sunglasses: '#080808',
    sunglassesW: 26,
    sunglassesH: 7,
    outline: '#555555',
    belt: '#444444',
  },
  smith: {
    skin: '#F0C890',
    skinShadow: '#C89858',
    hair: '#2a2518',
    hairStyle: 'parted',
    shirt: '#c8c8c8',
    tie: '#991111',
    outfit: '#222240',
    outfitLight: '#383858',
    jacket: '#161630',
    jacketLen: 28,
    boots: '#101020',
    sunglasses: '#080810',
    sunglassesW: 24,
    sunglassesH: 7,
    earpiece: true,
    outline: '#505070',
  },
  morpheus: {
    skin: '#8B6914',
    skinShadow: '#6B4F0A',
    hair: null,
    outfit: '#1a0e08',
    outfitLight: '#2a1a10',
    coat: '#120804',
    coatLen: 60,
    boots: '#0a0a0a',
    sunglasses: '#554400',
    sunglassesW: 10,
    sunglassesH: 8,
    sunglassesRound: true,
    outline: '#1a1008',
  },
  rebel: {
    skin: '#E8C49A',
    skinShadow: '#C4A070',
    hair: '#443322',
    hairStyle: 'messy',
    outfit: '#3a3a2a',
    outfitLight: '#4a4a38',
    boots: '#2a2a1a',
    outline: '#333322',
  },
};


// ---- Animation Poses (unchanged — same joint angle system) ----
// Positive = forward (toward facing direction)

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


// ============================================================
// Drawing helpers — anatomical shapes with volumetric shading
// ============================================================

/**
 * Draw an anatomically shaped limb with optional muscle contour and gradient.
 * Uses bezier curves for organic shapes instead of rectangles.
 */
function drawShapedLimb(ctx, topW, botW, length, muscle, color, outline) {
  const tw = topW / 2;
  const bw = botW / 2;
  const maxHW = Math.max(tw, bw) + (muscle ? muscle.bulge : 0);

  ctx.fillStyle = limbGradient(ctx, maxHW, color);
  ctx.beginPath();

  if (muscle && muscle.bulge > 0) {
    const mp = length * muscle.pos;
    const mw = maxHW;

    // Start top-left
    ctx.moveTo(-tw, 0);
    // Left contour: top → muscle peak → bottom
    ctx.bezierCurveTo(-tw, mp * 0.35, -mw, mp * 0.65, -mw, mp);
    ctx.bezierCurveTo(-mw, mp + (length - mp) * 0.4, -bw, length * 0.88, -bw, length);
    // Bottom rounded cap
    const r = Math.min(bw, 2.5);
    ctx.quadraticCurveTo(-bw, length + r, 0, length + r);
    ctx.quadraticCurveTo(bw, length + r, bw, length);
    // Right contour: bottom → muscle peak → top
    ctx.bezierCurveTo(bw, length * 0.88, mw, mp + (length - mp) * 0.4, mw, mp);
    ctx.bezierCurveTo(mw, mp * 0.65, tw, mp * 0.35, tw, 0);
    // Top rounded cap
    ctx.quadraticCurveTo(tw, -r, 0, -r);
    ctx.quadraticCurveTo(-tw, -r, -tw, 0);
  } else {
    // Simple taper (no muscle bulge)
    const r = Math.min(Math.min(tw, bw), 2.5);
    ctx.moveTo(-tw, 0);
    // Slight curve even on tapered limbs for organic feel
    ctx.bezierCurveTo(-tw, length * 0.3, -bw, length * 0.6, -bw, length);
    ctx.quadraticCurveTo(-bw, length + r, 0, length + r);
    ctx.quadraticCurveTo(bw, length + r, bw, length);
    ctx.bezierCurveTo(bw, length * 0.6, tw, length * 0.3, tw, 0);
    ctx.quadraticCurveTo(tw, -r, 0, -r);
    ctx.quadraticCurveTo(-tw, -r, -tw, 0);
  }

  ctx.closePath();
  ctx.fill();

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }

  // Rim highlight on the lit edge (left side)
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-tw + 0.5, 2);
  ctx.lineTo(-bw + 0.5, length - 2);
  ctx.stroke();
  ctx.restore();

  // Specular highlight spot
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(tw * 0.15, length * 0.38, tw * 0.25, length * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Joint shadow at top (ambient occlusion where limb connects)
  ctx.save();
  ctx.globalAlpha = 0.2;
  const jointShadow = ctx.createLinearGradient(0, -1, 0, 6);
  jointShadow.addColorStop(0, '#000000');
  jointShadow.addColorStop(1, 'transparent');
  ctx.fillStyle = jointShadow;
  ctx.fillRect(-tw, -1, tw * 2, 7);
  ctx.restore();
}

/**
 * Draw a rounded shoulder cap (deltoid muscle).
 */
function drawShoulderCap(ctx, radius, color, outline) {
  const grad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.25, 0, 0, 0, radius);
  grad.addColorStop(0, shade(color, 35));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, shade(color, -30));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
}

/**
 * Draw a shaped torso with chest/waist definition and gradient shading.
 */
function drawTorso(ctx, skin) {
  const sW = BODY.shoulderW / 2;
  const cW = BODY.chestW / 2;
  const wW = BODY.waistW / 2;
  const len = BODY.torsoLen;
  const color = skin.outfit;
  const outline = skin.outline;

  // Volumetric gradient — very high contrast for dark clothing
  const grad = ctx.createLinearGradient(-cW, 0, cW, 0);
  grad.addColorStop(0, shade(color, -40));
  grad.addColorStop(0.2, shade(color, 25));
  grad.addColorStop(0.42, shade(color, 45));
  grad.addColorStop(0.6, shade(color, 15));
  grad.addColorStop(1, shade(color, -45));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-sW, 0);
  // Left side: shoulder → chest bulge → waist
  ctx.bezierCurveTo(-cW, len * 0.15, -cW, len * 0.25, -cW + 1, len * 0.35);
  ctx.bezierCurveTo(-cW + 2, len * 0.5, -wW - 2, len * 0.7, -wW, len);
  // Bottom
  ctx.lineTo(wW, len);
  // Right side: waist → chest → shoulder
  ctx.bezierCurveTo(wW + 2, len * 0.7, cW - 2, len * 0.5, cW - 1, len * 0.35);
  ctx.bezierCurveTo(cW, len * 0.25, cW, len * 0.15, sW, 0);
  ctx.closePath();
  ctx.fill();

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }

  // Center line definition (sternum/ab separation)
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, len - 4);
  ctx.stroke();
  ctx.restore();

  // Pec line (horizontal across upper chest)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-cW + 4, len * 0.28);
  ctx.quadraticCurveTo(0, len * 0.32, cW - 4, len * 0.28);
  ctx.stroke();
  ctx.restore();

  // Ab hints (subtle horizontal lines in lower torso)
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 2; i++) {
    const ay = len * (0.55 + i * 0.15);
    ctx.beginPath();
    ctx.moveTo(-wW + 2, ay);
    ctx.quadraticCurveTo(0, ay + 1, wW - 2, ay);
    ctx.stroke();
  }
  ctx.restore();

  // Top-down lighting overlay
  ctx.save();
  ctx.globalAlpha = 0.12;
  const topGrad = ctx.createLinearGradient(0, 0, 0, len);
  topGrad.addColorStop(0, '#ffffff');
  topGrad.addColorStop(0.4, '#ffffff');
  topGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = topGrad;
  // Re-trace the path for fill
  ctx.beginPath();
  ctx.moveTo(-sW, 0);
  ctx.bezierCurveTo(-cW, len * 0.15, -cW, len * 0.25, -cW + 1, len * 0.35);
  ctx.bezierCurveTo(-cW + 2, len * 0.5, -wW - 2, len * 0.7, -wW, len);
  ctx.lineTo(wW, len);
  ctx.bezierCurveTo(wW + 2, len * 0.7, cW - 2, len * 0.5, cW - 1, len * 0.35);
  ctx.bezierCurveTo(cW, len * 0.25, cW, len * 0.15, sW, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Rim highlight on left edge
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-sW + 1, 2);
  ctx.bezierCurveTo(-cW + 1, len * 0.15, -cW + 1, len * 0.35, -wW, len * 0.7);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw an anatomical head with oval shape, jaw definition, and facial features.
 */
function drawHead(ctx, skin) {
  const rx = BODY.headRX;
  const ry = BODY.headRY;

  // Head shape: oval with jaw definition
  const grad = ctx.createRadialGradient(-rx * 0.15, -ry * 0.15, 0, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0, shade(skin.skin, 12));
  grad.addColorStop(0.7, skin.skin);
  grad.addColorStop(1, skin.skinShadow || shade(skin.skin, -25));

  ctx.fillStyle = grad;
  ctx.beginPath();
  const jawY = ry * 0.55;
  const jawW = BODY.jawW;
  // Chin
  ctx.moveTo(0, ry);
  // Right jaw → right cheek → top of head
  ctx.bezierCurveTo(jawW * 0.5, ry, jawW, jawY, rx, 0);
  ctx.bezierCurveTo(rx, -ry * 0.5, rx * 0.7, -ry, 0, -ry);
  // Top of head → left cheek → left jaw
  ctx.bezierCurveTo(-rx * 0.7, -ry, -rx, -ry * 0.5, -rx, 0);
  ctx.bezierCurveTo(-jawW, jawY, -jawW * 0.5, ry, 0, ry);
  ctx.closePath();
  ctx.fill();

  // Head outline
  ctx.strokeStyle = skin.outline || '#333';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // ---- Hair ----
  if (skin.hairStyle === 'slicked') {
    const hairGrad = ctx.createLinearGradient(0, -ry, 0, 0);
    hairGrad.addColorStop(0, shade(skin.hair, 10));
    hairGrad.addColorStop(1, skin.hair);
    ctx.fillStyle = hairGrad;
    ctx.beginPath();
    ctx.moveTo(-rx - 1, 0);
    ctx.bezierCurveTo(-rx - 1, -ry * 0.5, -rx * 0.7, -ry - 2, 0, -ry - 2);
    ctx.bezierCurveTo(rx * 0.7, -ry - 2, rx + 1, -ry * 0.5, rx + 1, 0);
    ctx.lineTo(rx + 2, -2);
    ctx.lineTo(-rx - 2, -2);
    ctx.closePath();
    ctx.fill();
    // Hair shine streak
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.3, -ry - 1);
    ctx.quadraticCurveTo(0, -ry * 0.6, rx * 0.4, -3);
    ctx.stroke();
    ctx.restore();
  } else if (skin.hairStyle === 'parted') {
    const hairGrad = ctx.createLinearGradient(0, -ry, 0, 0);
    hairGrad.addColorStop(0, shade(skin.hair, 8));
    hairGrad.addColorStop(1, skin.hair);
    ctx.fillStyle = hairGrad;
    ctx.beginPath();
    ctx.moveTo(-rx - 1, 0);
    ctx.bezierCurveTo(-rx - 1, -ry * 0.5, -rx * 0.7, -ry - 1, 0, -ry - 1);
    ctx.bezierCurveTo(rx * 0.7, -ry - 1, rx + 1, -ry * 0.4, rx + 1, -1);
    ctx.lineTo(rx, -1);
    ctx.lineTo(-rx, 0);
    ctx.closePath();
    ctx.fill();
    // Part line
    ctx.strokeStyle = shade(skin.hair, -15);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-rx * 0.3, -ry - 1);
    ctx.lineTo(-rx * 0.25, -2);
    ctx.stroke();
    // Hair shine streak
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rx * 0.1, -ry);
    ctx.quadraticCurveTo(rx * 0.4, -ry * 0.5, rx * 0.5, -2);
    ctx.stroke();
    ctx.restore();
  } else if (skin.hairStyle === 'messy') {
    ctx.fillStyle = skin.hair;
    ctx.beginPath();
    ctx.moveTo(-rx - 2, 0);
    ctx.bezierCurveTo(-rx - 2, -ry * 0.6, -rx * 0.8, -ry - 3, 0, -ry - 3);
    ctx.bezierCurveTo(rx * 0.8, -ry - 3, rx + 2, -ry * 0.6, rx + 2, 0);
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI + (i / 5) * Math.PI;
      const spike = Math.max(rx, ry) + 3 + (i % 2) * 4;
      ctx.lineTo(Math.cos(angle) * spike, Math.sin(angle) * spike - 2);
    }
    ctx.closePath();
    ctx.fill();
  }
  // Bald: no hair (morpheus)

  // ---- Sunglasses ----
  if (skin.sunglasses) {
    const sw = skin.sunglassesW || 18;
    const sh = skin.sunglassesH || 5;

    if (skin.sunglassesRound) {
      // Round glasses (Morpheus)
      const lGrad = ctx.createRadialGradient(-5, -1, 0, -5, 0, sh + 1);
      lGrad.addColorStop(0, shade(skin.sunglasses, 20));
      lGrad.addColorStop(1, skin.sunglasses);
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(-5, 0, sh, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      const rGrad = ctx.createRadialGradient(5, -1, 0, 5, 0, sh + 1);
      rGrad.addColorStop(0, shade(skin.sunglasses, 20));
      rGrad.addColorStop(1, skin.sunglasses);
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(5, 0, sh, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Bridge
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5 + sh, 0);
      ctx.lineTo(5 - sh, 0);
      ctx.stroke();

      // Temple arms
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-5 - sh, 0);
      ctx.lineTo(-rx - 1, -1);
      ctx.moveTo(5 + sh, 0);
      ctx.lineTo(rx + 1, -1);
      ctx.stroke();
    } else {
      // Rectangular glasses (Neo, Smith)
      const x = -sw / 2;
      const y = -sh / 2;

      // Lens gradient
      const lensGrad = ctx.createLinearGradient(x, y, x + sw, y + sh);
      lensGrad.addColorStop(0, shade(skin.sunglasses, 12));
      lensGrad.addColorStop(0.5, skin.sunglasses);
      lensGrad.addColorStop(1, shade(skin.sunglasses, -8));
      ctx.fillStyle = lensGrad;

      // Rounded rectangle lens shape
      const lr = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + lr, y);
      ctx.lineTo(x + sw - lr, y);
      ctx.quadraticCurveTo(x + sw, y, x + sw, y + lr);
      ctx.lineTo(x + sw, y + sh - lr);
      ctx.quadraticCurveTo(x + sw, y + sh, x + sw - lr, y + sh);
      ctx.lineTo(x + lr, y + sh);
      ctx.quadraticCurveTo(x, y + sh, x, y + sh - lr);
      ctx.lineTo(x, y + lr);
      ctx.quadraticCurveTo(x, y, x + lr, y);
      ctx.closePath();
      ctx.fill();

      // Frame — thick for readability
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Green Matrix reflection — iconic look
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#44ff44';
      ctx.fillRect(x + 2, y + 1, sw * 0.35, sh * 0.55);
      ctx.restore();

      // White glare spot
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + sw * 0.55, y + 1, sw * 0.15, sh * 0.4);
      ctx.restore();

      // Temple arms
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(-rx - 1, -1);
      ctx.moveTo(x + sw, 0);
      ctx.lineTo(rx + 1, -1);
      ctx.stroke();
    }
  }

  // Earpiece (Smith) — with green LED glow
  if (skin.earpiece) {
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(rx, -2);
    ctx.lineTo(rx + 4, -2);
    ctx.lineTo(rx + 4, 5);
    ctx.lineTo(rx, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // Wire
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(rx + 3, 5);
    ctx.quadraticCurveTo(rx + 3, 10, rx, 12);
    ctx.stroke();
    // Green LED indicator
    ctx.save();
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(rx + 2, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Nose shadow
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = skin.skinShadow || shade(skin.skin, -35);
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(2, 2);
  ctx.lineTo(0, 7);
  ctx.stroke();
  ctx.restore();

  // Mouth line
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = skin.skinShadow || shade(skin.skin, -35);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-4, ry * 0.48);
  ctx.lineTo(4, ry * 0.48);
  ctx.stroke();
  ctx.restore();

  // Chin shadow
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = skin.skinShadow || shade(skin.skin, -30);
  ctx.beginPath();
  ctx.ellipse(0, ry * 0.7, jawW * 0.7, ry * 0.2, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();

  // Head specular highlight (overhead light)
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, -ry * 0.5, rx * 0.5, ry * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a shaped hand/fist with gradient.
 */
function drawHand(ctx, color, outline, radius) {
  // Sleeve cuff (drawn before hand, at wrist position)
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = outline || '#333';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(-radius - 1, -1);
  ctx.lineTo(radius + 1, -1);
  ctx.stroke();
  ctx.restore();

  const grad = ctx.createRadialGradient(-1, radius - 1, 0, 0, radius, radius + 1);
  grad.addColorStop(0, shade(color, 15));
  grad.addColorStop(1, shade(color, -10));
  ctx.fillStyle = grad;

  // Angular fist shape
  ctx.beginPath();
  ctx.moveTo(-radius, radius * 0.3);
  ctx.quadraticCurveTo(-radius, radius * 2, 0, radius * 2.1);
  ctx.quadraticCurveTo(radius, radius * 2, radius + 0.5, radius * 0.3);
  ctx.quadraticCurveTo(radius, -radius * 0.2, 0, -radius * 0.2);
  ctx.quadraticCurveTo(-radius, -radius * 0.2, -radius, radius * 0.3);
  ctx.closePath();
  ctx.fill();

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/**
 * Draw a shaped boot instead of a flat rectangle.
 */
function drawBoot(ctx, color, outline) {
  const w = BODY.footW;
  const h = BODY.footH;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, shade(color, 8));
  grad.addColorStop(1, shade(color, -12));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(-3, h * 0.4);
  ctx.quadraticCurveTo(-3, h, 0, h);
  ctx.lineTo(w - 4, h);
  ctx.quadraticCurveTo(w - 1, h, w - 1, h * 0.6);
  ctx.lineTo(w - 2, 0);
  ctx.closePath();
  ctx.fill();

  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Sole line
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-1, h * 0.7);
  ctx.lineTo(w - 3, h * 0.7);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw the neck with trapezoidal shape and shading.
 */
function drawNeck(ctx, skin) {
  const nw = BODY.neckW / 2;
  const nlen = BODY.neckLen;
  const sY = SHOULDER_Y;

  const grad = ctx.createLinearGradient(-nw, 0, nw, 0);
  grad.addColorStop(0, shade(skin.skin, -15));
  grad.addColorStop(0.4, skin.skin);
  grad.addColorStop(1, shade(skin.skin, -20));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-nw, sY);
  ctx.lineTo(-nw + 1.5, sY - nlen);
  ctx.lineTo(nw - 1.5, sY - nlen);
  ctx.lineTo(nw, sY);
  ctx.closePath();
  ctx.fill();

  // Throat shadow
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(0, sY - nlen * 0.3, nw * 0.6, nlen * 0.4, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();
}

/**
 * Flowing coat with multi-point dynamics and gradient shading.
 */
function drawCoat(ctx, shoulderY, torsoLen, shoulderW, coatLen, color, swingAngle) {
  const sw = shoulderW / 2 + 6;
  const midW = shoulderW / 2 + 3;
  const botW = shoulderW / 2 + 12;
  const botY = shoulderY + torsoLen + coatLen;
  const swing = swingAngle * DEG;

  // Multi-point gradient — very high contrast for coat volume
  const grad = ctx.createLinearGradient(-botW, shoulderY, botW, shoulderY);
  grad.addColorStop(0, shade(color, -35));
  grad.addColorStop(0.2, shade(color, 22));
  grad.addColorStop(0.42, shade(color, 40));
  grad.addColorStop(0.6, shade(color, 12));
  grad.addColorStop(1, shade(color, -40));

  const rSwing = Math.sin(swing) * 10;
  const lSwing = Math.sin(swing) * 6;

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY);
  ctx.lineTo(sw, shoulderY);
  // Right side flows down
  ctx.bezierCurveTo(
    sw + 2, shoulderY + torsoLen * 0.4,
    midW + 3, shoulderY + torsoLen * 0.8,
    midW + 2, shoulderY + torsoLen
  );
  // Right bottom flare
  ctx.bezierCurveTo(
    midW + 4, shoulderY + torsoLen + coatLen * 0.3,
    botW + rSwing, botY - coatLen * 0.2,
    botW + rSwing, botY
  );
  // Bottom hem with wave
  ctx.quadraticCurveTo(
    botW * 0.3 + rSwing * 0.5, botY + 3,
    0, botY + 2
  );
  ctx.quadraticCurveTo(
    -botW * 0.3 + lSwing * 0.5, botY + 3,
    -botW + lSwing, botY
  );
  // Left bottom flare
  ctx.bezierCurveTo(
    -botW + lSwing, botY - coatLen * 0.2,
    -midW - 4, shoulderY + torsoLen + coatLen * 0.3,
    -midW - 2, shoulderY + torsoLen
  );
  // Left side flows up
  ctx.bezierCurveTo(
    -midW - 3, shoulderY + torsoLen * 0.8,
    -sw - 2, shoulderY + torsoLen * 0.4,
    -sw, shoulderY
  );
  ctx.closePath();
  ctx.fill();

  // Edge highlight (left) — visible rim light
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY + 2);
  ctx.lineTo(-midW - 2, shoulderY + torsoLen);
  ctx.lineTo(-botW + lSwing, botY);
  ctx.stroke();
  ctx.restore();

  // Green environmental reflection on lit side (Matrix world tint)
  ctx.save();
  ctx.globalAlpha = 0.12;
  const envGrad = ctx.createLinearGradient(-botW, shoulderY, botW * 0.3, shoulderY);
  envGrad.addColorStop(0, 'transparent');
  envGrad.addColorStop(0.6, '#22ff44');
  envGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = envGrad;
  // Re-trace coat shape for environment fill
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY);
  ctx.lineTo(sw, shoulderY);
  ctx.lineTo(midW + 2, shoulderY + torsoLen);
  ctx.lineTo(botW + rSwing, botY);
  ctx.lineTo(-botW + lSwing, botY);
  ctx.lineTo(-midW - 2, shoulderY + torsoLen);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Coat fold lines — visible at game scale
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(0, shoulderY + torsoLen + 4);
  ctx.lineTo(rSwing * 0.3, botY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(midW * 0.5, shoulderY + torsoLen + 4);
  ctx.lineTo(midW * 0.5 + rSwing * 0.2, botY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-midW * 0.5, shoulderY + torsoLen + 4);
  ctx.lineTo(-midW * 0.5 + lSwing * 0.2, botY - 4);
  ctx.stroke();
  ctx.restore();
}

/**
 * Detailed jacket with lapels, gradient, and button.
 */
function drawJacket(ctx, shoulderY, torsoLen, shoulderW, jacketLen, color) {
  const sw = shoulderW / 2 + 4;
  const botW = shoulderW / 2;
  const botY = shoulderY + torsoLen + jacketLen;

  const grad = ctx.createLinearGradient(-sw, shoulderY, sw, shoulderY);
  grad.addColorStop(0, shade(color, -32));
  grad.addColorStop(0.2, shade(color, 20));
  grad.addColorStop(0.42, shade(color, 35));
  grad.addColorStop(0.6, shade(color, 10));
  grad.addColorStop(1, shade(color, -38));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY);
  ctx.lineTo(sw, shoulderY);
  ctx.bezierCurveTo(sw, shoulderY + jacketLen * 0.5, botW + 2, botY - 4, botW, botY);
  ctx.lineTo(-botW, botY);
  ctx.bezierCurveTo(-botW - 2, botY - 4, -sw, shoulderY + jacketLen * 0.5, -sw, shoulderY);
  ctx.closePath();
  ctx.fill();

  // Green environmental reflection (Matrix world tint)
  ctx.save();
  ctx.globalAlpha = 0.08;
  const envJGrad = ctx.createLinearGradient(-sw, shoulderY, sw * 0.3, shoulderY);
  envJGrad.addColorStop(0, 'transparent');
  envJGrad.addColorStop(0.6, '#22ff44');
  envJGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = envJGrad;
  ctx.beginPath();
  ctx.moveTo(-sw, shoulderY);
  ctx.lineTo(sw, shoulderY);
  ctx.lineTo(botW, botY);
  ctx.lineTo(-botW, botY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Lapels — clearly visible
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-4, shoulderY + 1);
  ctx.lineTo(-8, shoulderY + 24);
  ctx.moveTo(4, shoulderY + 1);
  ctx.lineTo(8, shoulderY + 24);
  ctx.stroke();
  ctx.restore();

  // Button
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, shoulderY + torsoLen * 0.6, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Tie with knot, blade, and highlight.
 */
function drawTie(ctx, shoulderY) {
  // Knot — bright red to pop through green filter
  ctx.fillStyle = '#cc1122';
  ctx.beginPath();
  ctx.moveTo(-3, shoulderY + 2);
  ctx.lineTo(3, shoulderY + 2);
  ctx.lineTo(2, shoulderY + 7);
  ctx.lineTo(-2, shoulderY + 7);
  ctx.closePath();
  ctx.fill();

  // Blade with gradient — vivid red
  const grad = ctx.createLinearGradient(-4, shoulderY + 7, 4, shoulderY + 7);
  grad.addColorStop(0, '#881515');
  grad.addColorStop(0.4, '#cc2222');
  grad.addColorStop(1, '#991818');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-4, shoulderY + 7);
  ctx.lineTo(4, shoulderY + 7);
  ctx.lineTo(2.5, shoulderY + 32);
  ctx.lineTo(0, shoulderY + 36);
  ctx.lineTo(-2.5, shoulderY + 32);
  ctx.closePath();
  ctx.fill();

  // Highlight stripe
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0.5, shoulderY + 7);
  ctx.lineTo(0.3, shoulderY + 30);
  ctx.stroke();
  ctx.restore();
}

/**
 * Shirt collar with gradient shading.
 */
function drawShirtCollar(ctx, shoulderY) {
  const grad = ctx.createLinearGradient(-8, shoulderY, 8, shoulderY);
  grad.addColorStop(0, '#bbbbbb');
  grad.addColorStop(0.5, '#dddddd');
  grad.addColorStop(1, '#bbbbbb');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-9, shoulderY);
  ctx.lineTo(-3, shoulderY + 9);
  ctx.lineTo(0, shoulderY + 4);
  ctx.lineTo(3, shoulderY + 9);
  ctx.lineTo(9, shoulderY);
  ctx.lineTo(7, shoulderY + 2);
  ctx.lineTo(0, shoulderY + 6);
  ctx.lineTo(-7, shoulderY + 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}


/**
 * Draw a visible V-shaped shirt panel (for characters wearing suit + shirt, like Smith).
 * Creates a white/light area on the upper torso that breaks up the dark jacket.
 */
function drawShirtPanel(ctx, shoulderY, shirtColor) {
  const grad = ctx.createLinearGradient(-14, shoulderY, 14, shoulderY);
  grad.addColorStop(0, shade(shirtColor, -20));
  grad.addColorStop(0.5, shirtColor);
  grad.addColorStop(1, shade(shirtColor, -20));

  ctx.fillStyle = grad;
  ctx.beginPath();
  // Wide V-neck shirt visible between jacket lapels
  ctx.moveTo(-14, shoulderY + 1);
  ctx.lineTo(-2, shoulderY + 36);
  ctx.lineTo(2, shoulderY + 36);
  ctx.lineTo(14, shoulderY + 1);
  ctx.closePath();
  ctx.fill();

  // Shirt edge lines
  ctx.strokeStyle = shade(shirtColor, -35);
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Button line down center
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = shade(shirtColor, -40);
  ctx.lineWidth = 0.6;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(0, shoulderY + 8);
  ctx.lineTo(0, shoulderY + 34);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/**
 * Draw a belt/waistline to break up all-black outfits (like Neo).
 */
function drawBelt(ctx, hipY, waistW, beltColor) {
  const hw = waistW / 2 + 2;
  const grad = ctx.createLinearGradient(-hw, 0, hw, 0);
  grad.addColorStop(0, shade(beltColor, -15));
  grad.addColorStop(0.5, shade(beltColor, 25));
  grad.addColorStop(1, shade(beltColor, -15));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-hw, hipY - 3);
  ctx.lineTo(hw, hipY - 3);
  ctx.lineTo(hw, hipY + 3);
  ctx.lineTo(-hw, hipY + 3);
  ctx.closePath();
  ctx.fill();

  // Belt outline
  ctx.strokeStyle = shade(beltColor, -20);
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Belt buckle (metallic)
  const buckleGrad = ctx.createLinearGradient(-3, hipY - 2, 3, hipY + 2);
  buckleGrad.addColorStop(0, '#888888');
  buckleGrad.addColorStop(0.5, '#cccccc');
  buckleGrad.addColorStop(1, '#777777');
  ctx.fillStyle = buckleGrad;
  ctx.fillRect(-3, hipY - 2.5, 6, 5);
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(-3, hipY - 2.5, 6, 5);
}


// ============================================================
// Main character body drawing
// ============================================================

function drawCharacterBody(ctx, joints, skin, opacity) {
  if (opacity !== undefined && opacity < 1) {
    ctx.globalAlpha = opacity;
  }

  const sY = SHOULDER_Y;
  const hY = HIP_Y;
  const outline = skin.outline;
  const armColor = skin.outfitLight || skin.outfit;
  const legColor = skin.outfit;
  const handColor = skin.gloves || skin.skin;
  const bootColor = skin.boots || skin.outfit;

  // --- Ground shadow (gradient ellipse) — anchors character to floor ---
  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
  shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // === Back arm (left) ===
  ctx.save();
  ctx.translate(-BODY.shoulderOffX, sY);
  drawShoulderCap(ctx, BODY.shoulderCapR, armColor, outline);
  ctx.rotate(joints.lShoulder * DEG);
  drawShapedLimb(ctx, BODY.upperArmTop, BODY.upperArmBot, BODY.upperArmLen,
    { pos: 0.35, bulge: 2.5 }, armColor, outline);
  ctx.translate(0, BODY.upperArmLen);
  ctx.rotate(joints.lElbow * DEG);
  drawShapedLimb(ctx, BODY.forearmTop, BODY.forearmBot, BODY.forearmLen,
    { pos: 0.4, bulge: 1.5 }, armColor, outline);
  ctx.translate(0, BODY.forearmLen);
  drawHand(ctx, handColor, outline, BODY.handR);
  ctx.restore();

  // === Back leg (left) ===
  ctx.save();
  ctx.translate(-BODY.hipW / 2, hY);
  ctx.rotate(joints.lHip * DEG);
  drawShapedLimb(ctx, BODY.upperLegTop, BODY.upperLegBot, BODY.upperLegLen,
    { pos: 0.4, bulge: 2.5 }, legColor, outline);
  ctx.translate(0, BODY.upperLegLen);
  ctx.rotate(joints.lKnee * DEG);
  drawShapedLimb(ctx, BODY.lowerLegTop, BODY.lowerLegBot, BODY.lowerLegLen,
    { pos: BODY.calfPos, bulge: BODY.calfBulge }, legColor, outline);
  ctx.translate(0, BODY.lowerLegLen);
  drawBoot(ctx, bootColor, outline);
  ctx.restore();

  // === Coat/Jacket behind torso ===
  if (skin.coat) {
    drawCoat(ctx, sY, BODY.torsoLen, BODY.shoulderW, skin.coatLen, skin.coat, joints.coatSwing || 0);
  }
  if (skin.jacket) {
    drawJacket(ctx, sY, BODY.torsoLen, BODY.shoulderW, skin.jacketLen, skin.jacket);
  }

  // === Torso ===
  ctx.save();
  ctx.translate(0, sY);
  drawTorso(ctx, skin);
  if (skin.shirt) {
    drawShirtPanel(ctx, 0, skin.shirt);
    drawShirtCollar(ctx, 0);
  }
  if (skin.tie) drawTie(ctx, 0);
  // Coat collar — visible skin/neck area at top of coat for Neo-type characters
  if (skin.coat && !skin.shirt) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, 1);
    ctx.quadraticCurveTo(-6, 8, 0, 6);
    ctx.quadraticCurveTo(6, 8, 12, 1);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // === Belt (breaks up all-black outfits) ===
  if (skin.belt) {
    drawBelt(ctx, hY, BODY.waistW, skin.belt);
  }

  // === Neck ===
  drawNeck(ctx, skin);

  // === Front leg (right) ===
  ctx.save();
  ctx.translate(BODY.hipW / 2, hY);
  ctx.rotate(joints.rHip * DEG);
  drawShapedLimb(ctx, BODY.upperLegTop, BODY.upperLegBot, BODY.upperLegLen,
    { pos: 0.4, bulge: 2.5 }, legColor, outline);
  ctx.translate(0, BODY.upperLegLen);
  ctx.rotate(joints.rKnee * DEG);
  drawShapedLimb(ctx, BODY.lowerLegTop, BODY.lowerLegBot, BODY.lowerLegLen,
    { pos: BODY.calfPos, bulge: BODY.calfBulge }, legColor, outline);
  ctx.translate(0, BODY.lowerLegLen);
  drawBoot(ctx, bootColor, outline);
  ctx.restore();

  // === Front arm (right) — slightly brighter than back arm for depth ===
  const frontArmColor = skin.outfitLight ? shade(skin.outfitLight, 8) : armColor;
  ctx.save();
  ctx.translate(BODY.shoulderOffX, sY);
  drawShoulderCap(ctx, BODY.shoulderCapR, frontArmColor, outline);
  ctx.rotate(joints.rShoulder * DEG);
  drawShapedLimb(ctx, BODY.upperArmTop, BODY.upperArmBot, BODY.upperArmLen,
    { pos: 0.35, bulge: 3 }, frontArmColor, outline);
  ctx.translate(0, BODY.upperArmLen);
  ctx.rotate(joints.rElbow * DEG);
  drawShapedLimb(ctx, BODY.forearmTop, BODY.forearmBot, BODY.forearmLen,
    { pos: 0.35, bulge: 1.5 }, frontArmColor, outline);
  ctx.translate(0, BODY.forearmLen);
  drawHand(ctx, handColor, outline, BODY.handR);
  ctx.restore();

  // === Head ===
  ctx.save();
  ctx.translate(0, HEAD_Y);
  ctx.rotate(joints.head * DEG);
  drawHead(ctx, skin);
  ctx.restore();

  ctx.globalAlpha = 1;
}


// ============================================================
// Character class (game logic + rendering — interface unchanged)
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
      this.walkCycle += dt * 6;
      const mix = (Math.sin(this.walkCycle) + 1) / 2;
      this.targetPose = lerpPose(POSES.walk1, POSES.walk2, mix);
      this.lerpSpeed = 10;
    } else {
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
        skinShadow: '#cccccc',
        outfit: '#ffffff',
        outfitLight: '#ffffff',
        coat: this.skin.coat ? '#ffffff' : undefined,
        jacket: this.skin.jacket ? '#ffffff' : undefined,
        boots: '#ffffff',
      });
      ctx.restore();
    }

    ctx.restore();
  }
}
