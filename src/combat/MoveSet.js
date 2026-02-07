export const MOVES = {
  lightPunch: {
    name: 'Light Punch',
    key: 'j',
    damage: 5,
    range: 100,
    startup: 0.05,
    active: 0.1,
    recovery: 0.2,
    knockback: 30,
    energyCost: 0,
    energyGain: 5,
    hitstun: 0.3,
    blockstun: 0.15,
    animation: { type: 'punch' },
    sound: 'punch',
  },
  heavyKick: {
    name: 'Heavy Kick',
    key: 'k',
    damage: 10,
    range: 130,
    startup: 0.15,
    active: 0.15,
    recovery: 0.35,
    knockback: 60,
    energyCost: 0,
    energyGain: 8,
    hitstun: 0.5,
    blockstun: 0.25,
    breaksBlock: false,
    animation: { type: 'kick' },
    sound: 'kick',
  },
  special: {
    name: 'Special Attack',
    key: 'l',
    damage: 20,
    range: 160,
    startup: 0.2,
    active: 0.2,
    recovery: 0.5,
    knockback: 100,
    energyCost: 30,
    energyGain: 0,
    hitstun: 0.8,
    blockstun: 0.4,
    breaksBlock: true,
    animation: { type: 'special' },
    sound: 'special',
  },
};

export const COMBOS = {
  tripleStrike: {
    name: 'Triple Strike',
    sequence: ['j', 'j', 'k'],
    window: 1.5,
    bonusDamage: 15,
    sound: 'combo',
  },
  finisher: {
    name: 'Finisher',
    sequence: ['j', 'k', 'l'],
    window: 2.0,
    bonusDamage: 30,
    sound: 'finisher',
  },
};

export const BLOCK = {
  damageReduction: 0.75,
  moveSpeedMultiplier: 0.3,
};

export const DODGE = {
  duration: 0.3,
  invincibilityDuration: 0.2,
  cooldown: 0.8,
  energyCost: 10,
  speed: 600,
};
