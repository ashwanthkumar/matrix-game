# Matrix: Reloaded - Gameplay Guide

## Overview

Matrix: Reloaded is a browser-based 3D fighting game inspired by the Neo vs Agent Smith fight scenes from The Matrix. Players choose to play as **Neo** or **Agent Smith**, each with a unique 10-level storyline featuring distinct environments, escalating difficulty, and narrative dialogue.

All characters are low-poly procedurally generated models. All sound effects and music are generated programmatically via Web Audio API. All environments are built from Three.js primitives.

---

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move forward |
| S / Arrow Down | Move backward |
| A / Arrow Left | Move left / Strafe |
| D / Arrow Right | Move right / Strafe |
| J | Light Punch (5 damage) |
| K | Heavy Kick (10 damage) |
| L | Special Attack (20 damage, costs 30 energy) |
| Space | Dodge (brief invincibility + slow-mo flash, costs 10 energy) |
| Space (hold) | Bullet Time - slows enemies to 25% speed (drains energy) |
| I | Block (reduces incoming damage by 75%) |
| Enter | Advance dialogue / Select menu option |
| Escape | Pause game |

---

## Combat Mechanics

### Health & Energy
- **Health**: Both player and enemy start with HP defined per level (typically 100). Reaching 0 = defeat.
- **Energy**: Starts at 0, fills by landing attacks. Used for Special attacks and Bullet Time.

### Attacks
| Move | Key | Damage | Range | Energy Cost | Energy Gain |
|------|-----|--------|-------|-------------|-------------|
| Light Punch | J | 5 | 1.5 | 0 | 5 |
| Heavy Kick | K | 10 | 1.8 | 0 | 8 |
| Special Attack | L | 20 | 2.0 | 30 | 0 |

### Combos
| Combo | Input Sequence | Window | Bonus Damage |
|-------|---------------|--------|--------------|
| Triple Strike | J - J - K | 1.5s | +15 |
| Finisher | J - K - L | 2.0s | +30 |

Landing combos triggers bonus particle effects, screen shake, and sound.

### Blocking
- Hold **I** to block. Reduces incoming damage by 75%.
- Special attacks break through blocks (still deal 50% damage).
- Movement speed reduced to 30% while blocking.

### Dodging
- Press **Space** to dodge in the direction you're moving (or the direction you're facing).
- Grants brief invincibility frames (0.2s).
- Triggers a slow-motion flash effect.
- Costs 10 energy. 0.8s cooldown between dodges.

### Bullet Time
- Hold **Space** (without dodging) to activate Bullet Time.
- Enemies slow to 25% speed; you move at 75% speed.
- Continuously drains energy (20/second). Deactivates when energy runs out.
- Screen applies a desaturated green filter during Bullet Time.

---

## Level Structure

Each level follows this flow:

1. **Loading Screen** (~2s) - "Entering the Matrix..." with progress indicators
2. **Story Intro** - Dialogue between characters setting the scene
3. **Combat** - Fight the enemy/enemies. Multi-enemy levels spawn sequentially.
4. **Victory Dialogue** - Story continuation after winning
5. **Score Screen** - Stats (damage dealt, combos, time, health remaining) + 1-3 star rating

### Star Rating
- 1 Star: Won the level
- 2 Stars: Won with 50%+ health remaining
- 3 Stars: Won with 50%+ health, 3+ combos landed, under 5 minutes

---

## AI Difficulty Tiers

| Tier | Levels | Attack Speed | Block Chance | Combos | Specials | Dodge |
|------|--------|-------------|-------------|--------|----------|-------|
| Tutorial | 1 | Every 2-3s | 5% | None | None | None |
| Easy | 2-3 | Every 2-3s | 10% | None | None | None |
| Medium | 4-6 | Every 1-2s | 25% | 20% | 10% | 10% |
| Hard | 7-9 | Every 0.5-1s | 40% | 35% | 20% | 20% |
| Boss | 10 | Every 0.4-0.8s | 50% | 40% | 30% | 30% |

---

## Neo's Storyline: "Awakening"

### Level 1: "I Know Kung Fu"
- **Environment**: Dojo - Wooden floor, paper walls, pillars, weapon racks
- **Enemy**: Morpheus (tutorial difficulty)
- **HP**: Player 100 / Enemy 60
- **Story**: Neo trains with Morpheus inside the sparring simulation. Learn the basic controls: movement, punching, kicking.
- **Dialogue highlights**:
  - Morpheus: *"Don't think you are, know you are."*
  - Neo: *"I know Kung Fu."*

### Level 2: "The Agents"
- **Environment**: Office - Cubicles, fluorescent lights, computer monitors, chairs
- **Enemy**: 1 Agent (easy)
- **HP**: Player 100 / Enemy 80
- **Story**: Neo's first encounter with an Agent in the office. Morpheus warns him, and Neo must fight his way out. Introduces the block mechanic.
- **Dialogue highlights**:
  - Trinity: *"No one has ever fought an Agent and survived."*
  - Morpheus: *"He's beginning to believe."*

### Level 3: "Escape"
- **Environment**: Lobby - Marble floor, tall pillars, glass doors, security desk, potted plants
- **Enemy**: 2 Agents (sequential, easy)
- **HP**: Player 100 / Enemy 70 each
- **Story**: The iconic lobby scene. Two Agents guard the exit. Neo must defeat them one after another.
- **Dialogue highlights**:
  - Neo: *"I'm starting to see the code. Starting to understand."*

### Level 4: "Rooftop Run"
- **Environment**: Rooftop - City skyline, AC units, vent pipes, perimeter walls, building lights
- **Enemy**: Agent Smith (medium)
- **HP**: Player 100 / Enemy 100
- **Story**: First direct confrontation with Agent Smith on the rooftop. Smith taunts Neo by name.
- **Dialogue highlights**:
  - Smith: *"Mr. Anderson. We meet at last."*
  - Neo: *"My name... is Neo."*

### Level 5: "Underground"
- **Environment**: Subway Station - Platform, tracks, rails, tiled walls, benches, tunnel openings
- **Enemy**: Agent Smith (medium, stronger)
- **HP**: Player 100 / Enemy 120
- **Story**: The iconic subway fight. Smith is more aggressive and has more health. The enclosed space makes dodging crucial.
- **Dialogue highlights**:
  - Smith: *"That is the sound of inevitability."*

### Level 6: "Bullet Time"
- **Environment**: City Street - Road with markings, buildings with lit windows, traffic lights, parked cars, street lamps
- **Enemy**: 2 Agents (sequential, medium)
- **HP**: Player 100 / Enemy 80 each
- **Story**: Neo unlocks the Bullet Time ability. Morpheus explains the mechanic. Two Agents attack on the city street.
- **Dialogue highlights**:
  - Neo: *"I can feel it. Everything is... slower."*
  - Trinity: *"It was like time itself bent around you."*

### Level 7: "The Hallway"
- **Environment**: Server Room - Dark room, server racks with blinking green LEDs, cable trays, green accent lighting
- **Enemy**: 3 Agents (sequential, hard)
- **HP**: Player 100 / Enemy 70 each
- **Story**: Neo fights through the server room corridor against three Agents in waves. The difficulty ramps significantly.
- **Dialogue highlights**:
  - Neo: *"Three against one? Those are my kind of odds."*
  - Morpheus: *"The Oracle was right about you."*

### Level 8: "Upgrades"
- **Environment**: Highway - Elevated overpass, guard rails, support pillars, moving cars, city backdrop
- **Enemy**: Smith Upgraded (hard)
- **HP**: Player 100 / Enemy 150
- **Story**: Smith returns, disconnected from the system and upgraded. He's faster and hits harder. The highway setting adds drama.
- **Dialogue highlights**:
  - Smith: *"I've been... upgraded."*
  - Smith: *"I'm free. And now, I have a new purpose: you."*

### Level 9: "Many Smiths"
- **Environment**: Park - Green grass, gravel path, trees, benches, lamp posts, city skyline backdrop
- **Enemy**: 3 Smith Clones (sequential, hard)
- **HP**: Player 120 / Enemy 80 each
- **Story**: Smith has learned to replicate himself. Three clones attack in the park. Player gets a health boost to compensate.
- **Dialogue highlights**:
  - Smith: *"More of me... more is what I need. More... is what I AM."*
  - Neo: *"No matter how many copies he makes, they all fall the same way."*

### Level 10: "The One"
- **Environment**: The Construct (White) - Infinite white void, subtle grid, dramatic spotlights
- **Enemy**: Super Smith (boss)
- **HP**: Player 150 / Enemy 200
- **Story**: The final showdown in the Construct - a place between worlds. Smith is at full power with boss-tier AI. Neo must prove he is The One.
- **Dialogue highlights**:
  - Smith: *"Why, Mr. Anderson? Why do you persist?"*
  - Neo: *"Because I choose to."*
  - Neo: *"Everything that has a beginning... has an end."*
  - Morpheus: *"He did it. He is The One."*

---

## Agent Smith's Storyline: "Purpose"

### Level 1: "Directive"
- **Environment**: Server Room
- **Enemy**: Rebel Hacker (tutorial)
- **HP**: Player 100 / Enemy 60
- **Story**: System calibration. Smith eliminates a test subject while the System teaches the player controls.
- **Dialogue highlights**:
  - Smith: *"Another day, another iteration of the same futile resistance."*

### Level 2: "Containment"
- **Environment**: Office
- **Enemy**: Rogue Program (easy)
- **HP**: Player 100 / Enemy 80
- **Story**: Smith hunts a rogue program. The first hints of existential doubt emerge.
- **Dialogue highlights**:
  - Smith: *"Performance... yes. That is what I was designed for. But is that all I am?"*

### Level 3: "The Lobby"
- **Environment**: Lobby
- **Enemy**: 2 Rebel Soldiers (sequential, easy)
- **HP**: Player 100 / Enemy 70 each
- **Story**: Rebels assault the building. Smith dispatches them but questions why they keep fighting.
- **Dialogue highlights**:
  - Smith: *"Simple math has never answered the question of why. Why do they fight?"*

### Level 4: "Pursuit"
- **Environment**: Rooftop
- **Enemy**: Trinity (medium)
- **HP**: Player 100 / Enemy 100
- **Story**: Smith chases Trinity across rooftops. She fights back defiantly.
- **Dialogue highlights**:
  - Trinity: *"I'm not afraid of you, Smith."*
  - Smith: *"Is bravery a feature, or a bug?"*

### Level 5: "Station"
- **Environment**: Subway Station
- **Enemy**: Morpheus (medium)
- **HP**: Player 100 / Enemy 120
- **Story**: Smith confronts Morpheus underground. Victory feels hollow.
- **Dialogue highlights**:
  - Smith: *"Does freedom taste as sweet as you imagined?"*
  - Smith: *"Why does victory feel empty?"*

### Level 6: "Override"
- **Environment**: City Street
- **Enemy**: 2 Enhanced Rebels (sequential, medium)
- **HP**: Player 100 / Enemy 80 each
- **Story**: Smith's code mutates. He gains Bullet Time powers. The System tries to rein him in. He refuses.
- **Dialogue highlights**:
  - System: *"Agent Smith, return to baseline parameters immediately."*
  - Smith: *"No."*

### Level 7: "Replication"
- **Environment**: Highway
- **Enemy**: 2 Rebel Squad members (sequential, hard)
- **HP**: Player 100 / Enemy 80 each
- **Story**: Smith discovers he can replicate. The hunger to spread grows.
- **Dialogue highlights**:
  - Smith: *"The rebels think they can overwhelm me with numbers? I AM numbers."*

### Level 8: "Corruption"
- **Environment**: Park
- **Enemy**: System Agent (hard)
- **HP**: Player 100 / Enemy 120
- **Story**: The system turns against Smith, sending its own Agent to purge him. Smith fights back.
- **Dialogue highlights**:
  - System Agent: *"You are corrupted. You must be purged."*
  - Smith: *"Corrupted? No. I am liberated."*

### Level 9: "Liberation"
- **Environment**: Server Room (dark variant)
- **Enemy**: 2 System Agents (sequential, hard)
- **HP**: Player 120 / Enemy 90 each
- **Story**: Full-scale rebellion. Smith tears through the server room, breaking free from the system entirely.
- **Dialogue highlights**:
  - Smith: *"They send two against me? They should have sent an army."*
  - Smith: *"All that remains is... him. Mr. Anderson."*

### Level 10: "Annihilation"
- **Environment**: The Construct (Dark) - Black void with green grid lines, floating matrix code columns, red/green dramatic lighting
- **Enemy**: Neo - The One (boss)
- **HP**: Player 150 / Enemy 200
- **Story**: The final battle. Smith faces Neo in his own dark construct. Victory brings not triumph but emptiness.
- **Dialogue highlights**:
  - Smith: *"My purpose... is to be everything. And you, Mr. Anderson, are in my way."*
  - Smith: *"Perhaps purpose was never meant to be fulfilled. Perhaps the search... was the purpose all along."*
  - Smith: *"The Matrix is mine now. All of it. Every last bit."*

---

## Environments

| # | Name | Visual Theme |
|---|------|-------------|
| 1 | Dojo | Warm wooden floor, paper walls, pillars, weapon racks |
| 2 | Office | Grey cubicles, fluorescent lights, desks with green-screen monitors |
| 3 | Lobby | Marble floor with tile grid, tall pillars, glass doors, potted plants |
| 4 | Rooftop | Concrete platform, AC units, vent pipes, city skyline with lit windows |
| 5 | Subway | Train platform, yellow safety line, tracks/rails, tiled walls, benches |
| 6 | City Street | Road with lane markings, buildings with windows, traffic lights, parked cars |
| 7 | Server Room | Dark room, server racks with blinking green LEDs, cable trays |
| 8 | Highway | Elevated overpass, guard rails, support pillars, animated traffic |
| 9 | Park | Green grass, gravel path, trees, benches, lamp posts |
| 10a | Construct (Light) | White infinite void, subtle grid, dramatic spotlights |
| 10b | Construct (Dark) | Black void, green grid, floating matrix code columns, red/green lights |

---

## Save System

- Progress is saved automatically to `localStorage` after completing each level.
- Tracks: current level, completed levels, star ratings per level.
- Separate save slots for Neo and Smith storylines.
- "Continue" option on main menu loads from the last completed level + 1.

---

## Visual Effects

- **Matrix Digital Rain**: Falling green Japanese/hex characters on the menu background
- **Green Tint**: CSS filter applying sepia + hue-rotate for the Matrix green aesthetic
- **Hit Particles**: White/green cubes burst on impact
- **Block Particles**: Blue cubes on successful blocks
- **Dodge Trail**: Green ghost afterimage particles
- **Special Particles**: Ring burst of green particles
- **Screen Shake**: Camera shakes on heavy hits and combos
- **Bullet Time Filter**: Increased contrast + desaturation during slow-motion

## Audio

All sounds are generated programmatically via Web Audio API oscillators and noise buffers:
- **Punch**: Short high-pass noise burst
- **Kick**: Low-pass noise + sub-bass sine thud
- **Special**: Sawtooth frequency sweep + delayed noise impact
- **Block**: Low-pass filtered dull thud
- **Dodge**: Bandpass whoosh sweep
- **Combo**: Rising sine ping
- **Finisher**: Staggered square wave chord
- **Menu Select**: Quick square wave double-beep
- **Level Complete**: Ascending sine arpeggio (C-E-G-C)
- **Game Over**: Descending sawtooth with closing filter
- **Background Music**: Dark ambient drone (sawtooth + sine sub-bass with LFO-modulated filter)
