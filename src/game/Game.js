import { Scene } from './Scene.js';
import { input } from '../utils/Input.js';
import { audio } from '../utils/Audio.js';
import { saveSystem } from '../utils/SaveSystem.js';
import { Player } from '../entities/Player.js';
import { Enemy, AI_PRESETS } from '../entities/Enemy.js';
import { CombatSystem } from '../combat/CombatSystem.js';
import { LevelManager } from '../levels/LevelManager.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { HUD } from '../ui/HUD.js';
import { MainMenu } from '../ui/MainMenu.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { MatrixRain } from '../effects/MatrixRain.js';
import { ParticleSystem } from '../effects/Particles.js';
import { PostProcessing } from '../effects/PostProcessing.js';

// Game states
const STATES = {
  BOOT: 'BOOT',
  LOADING: 'LOADING',
  MENU: 'MENU',
  CHARACTER_SELECT: 'CHARACTER_SELECT',
  LOADING_LEVEL: 'LOADING_LEVEL',
  STORY_INTRO: 'STORY_INTRO',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  SCORE_SCREEN: 'SCORE_SCREEN',
  STORY_DIALOGUE: 'STORY_DIALOGUE',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
};

export class Game {
  constructor() {
    this.state = STATES.BOOT;
    this.prevState = null;

    // Core systems
    this.scene = null;
    this.combatSystem = new CombatSystem();
    this.levelManager = null;
    this.particles = null;
    this.postProcessing = null;

    // UI
    this.loadingScreen = new LoadingScreen();
    this.hud = new HUD();
    this.mainMenu = null;
    this.dialogueBox = new DialogueBox();
    this.pauseMenu = null;
    this.matrixRain = null;

    // Character select
    this.characterSelectEl = document.getElementById('character-select');
    this.selectedCharacter = 'neo';
    this.characterCards = this.characterSelectEl.querySelectorAll('.character-card');

    // Score screen
    this.scoreScreenEl = document.getElementById('score-screen');

    // Game over
    this.gameOverEl = document.getElementById('game-over');
    this.gameOverSelectedIndex = 0;

    // Victory
    this.victoryScreenEl = document.getElementById('victory-screen');

    // Entities
    this.player = null;
    this.enemies = [];
    this.currentEnemyIndex = 0;

    // Timing
    this.lastTime = 0;
    this.fixedTimeStep = 1 / 60;
    this.accumulator = 0;

    // Level state
    this.levelStartTime = 0;
    this.isStarting = false;
    this.waitingForNext = false;
  }

  async init() {
    // Create 2D Canvas scene
    const canvas = document.getElementById('game-canvas');
    this.scene = new Scene(canvas);

    // Post processing (CSS filters on canvas)
    this.postProcessing = new PostProcessing(this.scene.renderer);

    // Particles
    this.particles = new ParticleSystem();
    this.scene.particleSystem = this.particles;

    // Level manager
    this.levelManager = new LevelManager(this.scene);

    // Matrix rain
    const rainCanvas = document.getElementById('matrix-rain-canvas');
    this.matrixRain = new MatrixRain(rainCanvas);

    // UI setup
    this.mainMenu = new MainMenu(
      () => this.onNewGame(),
      () => this.onContinue()
    );

    this.pauseMenu = new PauseMenu(
      () => this.onResume(),
      () => this.onRestartLevel(),
      () => this.onQuitToMenu()
    );

    // Touch controls element
    this.touchControlsEl = document.getElementById('touch-controls');

    // Setup click/tap handlers for UI screens
    this._initClickHandlers();

    // Init audio
    audio.init();

    // Transition to loading
    this.setState(STATES.LOADING);
    this.loadingScreen.show('LOADING THE MATRIX...');

    // Simulate loading (no external assets)
    await this.loadingScreen.simulateProgress(1200);

    // Go to menu
    this.setState(STATES.MENU);
    this.loadingScreen.hide();
    this.matrixRain.start();
    this.mainMenu.show();
    audio.startMusic('menu');

    // Start game loop
    this.lastTime = performance.now();
    this.loop();
  }

  setState(newState) {
    this.prevState = this.state;
    this.state = newState;
    this._updateTouchControls();
  }

  _updateTouchControls() {
    if (!this.touchControlsEl || !input.isMobile) return;
    this.touchControlsEl.style.display = this.state === STATES.PLAYING ? 'block' : 'none';
  }

  _initClickHandlers() {
    // Character cards: tap to select + confirm
    this.characterCards.forEach(card => {
      card.addEventListener('click', () => {
        if (this.state !== STATES.CHARACTER_SELECT) return;
        const char = card.dataset.character;
        if (this.selectedCharacter !== char) {
          this.selectedCharacter = char;
          audio.play('menuSelect');
          this.updateCharacterSelection();
        } else {
          // Already selected, confirm
          audio.play('menuSelect');
          this.characterSelectEl.style.display = 'none';
          this.matrixRain.stop();
          audio.stopMusic();
          this.levelManager.setCharacter(this.selectedCharacter);
          const startLevel = this.prevState === STATES.MENU && saveSystem.hasSaveData(this.selectedCharacter)
            ? saveSystem.getCurrentLevel(this.selectedCharacter) : 0;
          this.startLevel(Math.min(startLevel, this.levelManager.getLevelCount() - 1));
        }
      });
    });

    // Game over options
    this.gameOverEl.querySelectorAll('.gameover-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (this.state !== STATES.GAME_OVER) return;
        audio.play('menuSelect');
        this.gameOverEl.style.display = 'none';
        const action = opt.dataset.action;
        if (action === 'retry') {
          this.startLevel(this.levelManager.currentLevelIndex);
        } else {
          this.onQuitToMenu();
        }
      });
    });

    // Score screen: tap to continue
    this.scoreScreenEl.addEventListener('click', () => {
      if (this.state !== STATES.SCORE_SCREEN) return;
      audio.play('menuSelect');
      this.scoreScreenEl.style.display = 'none';
      if (this.levelManager.hasNextLevel()) {
        this.startLevel(this.levelManager.currentLevelIndex + 1);
      } else {
        this.onVictory();
      }
    });

    // Victory screen: tap to return to menu
    this.victoryScreenEl.addEventListener('click', () => {
      if (this.state !== STATES.VICTORY) return;
      audio.play('menuSelect');
      this.victoryScreenEl.style.display = 'none';
      this.onQuitToMenu();
    });
  }

  // --- Menu callbacks ---

  onNewGame() {
    this.mainMenu.hide();
    this.setState(STATES.CHARACTER_SELECT);
    this.characterSelectEl.style.display = 'flex';
    this.selectedCharacter = 'neo';
    this.updateCharacterSelection();
  }

  onContinue() {
    this.mainMenu.hide();
    this.setState(STATES.CHARACTER_SELECT);
    this.characterSelectEl.style.display = 'flex';
    this.selectedCharacter = saveSystem.hasSaveData('neo') ? 'neo' : 'smith';
    this.updateCharacterSelection();
  }

  onResume() {
    this.pauseMenu.hide();
    this.setState(STATES.PLAYING);
  }

  onRestartLevel() {
    this.pauseMenu.hide();
    this.startLevel(this.levelManager.currentLevelIndex);
  }

  onQuitToMenu() {
    this.pauseMenu.hide();
    this.hud.hide();
    this.dialogueBox.hide();
    this.cleanupLevel();
    this.setState(STATES.MENU);
    this.matrixRain.start();
    this.mainMenu.show();
    audio.stopMusic();
    audio.startMusic('menu');
  }

  // --- Character select ---

  updateCharacterSelection() {
    this.characterCards.forEach(card => {
      card.classList.toggle('selected', card.dataset.character === this.selectedCharacter);
    });
  }

  updateCharacterSelect() {
    if (input.justPressed('arrowleft') || input.justPressed('a')) {
      this.selectedCharacter = 'neo';
      audio.play('menuSelect');
      this.updateCharacterSelection();
    }
    if (input.justPressed('arrowright') || input.justPressed('d')) {
      this.selectedCharacter = 'smith';
      audio.play('menuSelect');
      this.updateCharacterSelection();
    }
    if (input.justPressed('enter')) {
      audio.play('menuSelect');
      this.characterSelectEl.style.display = 'none';
      this.matrixRain.stop();
      audio.stopMusic();
      this.levelManager.setCharacter(this.selectedCharacter);

      const startLevel = this.prevState === STATES.MENU && saveSystem.hasSaveData(this.selectedCharacter)
        ? saveSystem.getCurrentLevel(this.selectedCharacter)
        : 0;

      this.startLevel(Math.min(startLevel, this.levelManager.getLevelCount() - 1));
    }
    if (input.justPressed('escape')) {
      this.characterSelectEl.style.display = 'none';
      this.setState(STATES.MENU);
      this.mainMenu.show();
    }
  }

  // --- Level management ---

  async startLevel(index) {
    if (this.isStarting) return;
    this.isStarting = true;

    this.setState(STATES.LOADING_LEVEL);
    this.hud.hide();
    this.loadingScreen.show('ENTERING THE MATRIX...');

    // Clean previous
    this.cleanupLevel();

    await new Promise(r => setTimeout(r, 300));
    this.loadingScreen.setText('Building environment...');

    // Load level environment
    const config = this.levelManager.loadLevel(index);
    if (!config) {
      this.isStarting = false;
      return;
    }

    await new Promise(r => setTimeout(r, 200));
    this.loadingScreen.setText('Spawning characters...');

    // Create player
    const playerType = this.selectedCharacter;
    this.player = new Player(playerType);
    this.player.health = config.playerHealth;
    this.player.maxHealth = config.playerHealth;

    const playerStart = this.levelManager.getPlayerStart();
    this.player.setPosition(playerStart.x);

    // Set bounds
    const bounds = this.levelManager.getBounds();
    this.player.bounds = bounds;

    // Add player to scene
    this.scene.addEntity(this.player);

    // Create enemies
    this.enemies = [];
    this.currentEnemyIndex = 0;

    // Map enemy types to character skins
    const enemyTypeToSkin = {
      smith: 'smith', super_smith: 'smith',
      agent: 'smith', rebel: 'rebel',
      neo_boss: 'neo',
    };

    const aiPreset = AI_PRESETS[config.aiPreset] || AI_PRESETS.easy;
    for (let i = 0; i < config.enemyCount; i++) {
      const skinType = enemyTypeToSkin[config.enemyType] || 'smith';
      const enemyConfig = {
        ...aiPreset,
        name: config.enemyCount > 1 ? `${config.enemyName} ${i + 1}` : config.enemyName,
      };
      const enemy = new Enemy(skinType, enemyConfig);
      enemy.health = config.enemyHealth;
      enemy.maxHealth = config.enemyHealth;
      enemy.bounds = bounds;

      const enemyStart = this.levelManager.getEnemyStart();
      if (i === 0) {
        enemy.setPosition(enemyStart.x);
        this.scene.addEntity(enemy);
      } else {
        enemy.setPosition(enemyStart.x + 50);
      }

      this.enemies.push(enemy);
    }

    // Reset combat
    this.combatSystem.reset();

    // Setup HUD
    this.hud.setLevelInfo(index + 1, config.title);
    this.hud.setEnemyName(config.enemyName);

    await new Promise(r => setTimeout(r, 200));
    this.loadingScreen.setText('Ready.');
    await new Promise(r => setTimeout(r, 300));

    // Hide loading, show story intro
    this.loadingScreen.hide();

    // Start music
    audio.startMusic('combat');

    // Show intro dialogue
    this.setState(STATES.STORY_INTRO);
    this.dialogueBox.showDialogues(config.introDialogue, () => {
      this.setState(STATES.PLAYING);
      this.hud.show();
      this.levelStartTime = Date.now();
    });

    this.isStarting = false;
  }

  cleanupLevel() {
    // Remove player
    if (this.player) {
      this.scene.removeEntity(this.player);
      this.player = null;
    }

    // Remove enemies
    this.enemies.forEach(e => {
      this.scene.removeEntity(e);
    });
    this.enemies = [];
    this.currentEnemyIndex = 0;

    // Clear particles
    if (this.particles) {
      this.particles.clear();
    }

    // Unload environment
    this.levelManager.unloadLevel();
  }

  getCurrentEnemy() {
    return this.enemies[this.currentEnemyIndex] || null;
  }

  spawnNextEnemy() {
    this.currentEnemyIndex++;
    const enemy = this.getCurrentEnemy();
    if (enemy) {
      const enemyStart = this.levelManager.getEnemyStart();
      enemy.setPosition(enemyStart.x);
      enemy.health = enemy.maxHealth;
      enemy.isDead = false;
      this.scene.addEntity(enemy);

      const config = this.levelManager.getCurrentConfig();
      this.hud.setEnemyName(enemy.aiConfig.name || config.enemyName);
      return true;
    }
    return false;
  }

  // --- Game loop ---

  loop() {
    requestAnimationFrame(() => this.loop());

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    this.update(dt);
    this.render();
    input.update();
  }

  update(dt) {
    if (this.matrixRain) this.matrixRain.update();

    switch (this.state) {
      case STATES.MENU:
        this.mainMenu.update();
        break;

      case STATES.CHARACTER_SELECT:
        this.updateCharacterSelect();
        break;

      case STATES.STORY_INTRO:
      case STATES.STORY_DIALOGUE:
      case STATES.LEVEL_COMPLETE:
        this.dialogueBox.update(dt);
        break;

      case STATES.PLAYING:
        this.updateGameplay(dt);
        break;

      case STATES.PAUSED:
        this.pauseMenu.update();
        break;

      case STATES.SCORE_SCREEN:
        this.updateScoreScreen();
        break;

      case STATES.GAME_OVER:
        this.updateGameOver();
        break;

      case STATES.VICTORY:
        this.updateVictory();
        break;
    }
  }

  updateGameplay(dt) {
    // Pause check
    if (input.justPressed('escape')) {
      this.setState(STATES.PAUSED);
      this.pauseMenu.show();
      return;
    }

    // Bullet time
    const bulletTime = this.combatSystem.bulletTime;
    if (input.isPressed(' ') && this.player && this.player.energy >= 5 && !this.player.isDodging) {
      bulletTime.activate();
      this.player.energy -= bulletTime.getEnergyDrain(dt);
      if (this.player.energy <= 0) {
        this.player.energy = 0;
        bulletTime.deactivate();
      }
      this.postProcessing.setBulletTimeEffect(true);
    } else if (bulletTime.active && !input.isPressed(' ')) {
      bulletTime.deactivate();
      this.postProcessing.setBulletTimeEffect(false);
    }

    bulletTime.update(dt);
    this.combatSystem.update(dt);

    // Player update with bullet time
    const playerDt = bulletTime.active ? bulletTime.getPlayerDt(dt) : dt;
    const enemyDt = bulletTime.active ? bulletTime.getEnemyDt(dt) : dt;

    if (this.player && !this.player.isDead) {
      const action = this.player.handleInput(playerDt);
      this.player.update(playerDt);

      const enemy = this.getCurrentEnemy();
      if (enemy) {
        this.player.updateFacing(enemy.position.x);
      }

      // Process player attacks
      if (action) {
        if (action.action === 'attack') {
          this.processPlayerAttack(action);
        } else if (action.action === 'dodge') {
          audio.play('dodge');
          bulletTime.flashSlowMo(0.2);
          this.postProcessing.setBulletTimeEffect(true);
          setTimeout(() => this.postProcessing.setBulletTimeEffect(false), 250);
          if (this.player) {
            this.particles.spawnDodgeTrail(this.player.position, action.direction);
          }
        }
      }
    }

    // Update enemies
    const enemy = this.getCurrentEnemy();
    if (enemy && !enemy.isDead) {
      const playerPos = this.player ? this.player.getPosition() : { x: 640 };
      const aiAction = enemy.updateAI(enemyDt, playerPos);
      enemy.update(enemyDt);

      if (this.player) {
        enemy.updateFacing(this.player.position.x);
      }

      // Process enemy attacks
      if (aiAction && aiAction.action === 'attack') {
        this.processEnemyAttack(aiAction);
      }
    }

    // Check enemy death
    if (enemy && enemy.isDead && !this.waitingForNext) {
      this.waitingForNext = true;
      setTimeout(() => {
        if (this.state !== STATES.PLAYING) { this.waitingForNext = false; return; }
        if (!this.spawnNextEnemy()) {
          this.onLevelComplete();
        }
        this.waitingForNext = false;
      }, 1000);
    }

    // Check player death
    if (this.player && this.player.isDead && this.state === STATES.PLAYING) {
      this.setState(STATES.LOADING_LEVEL);
      setTimeout(() => this.onGameOver(), 1500);
    }

    // Particles
    this.particles.update(dt);

    // Camera
    if (this.player) {
      this.scene.updateCamera(
        this.player.position,
        enemy && !enemy.isDead ? enemy.position : null
      );
    }

    // HUD update
    if (this.player) {
      this.hud.updatePlayerHealth(this.player.health, this.player.maxHealth);
      this.hud.updatePlayerEnergy(this.player.energy, this.player.maxEnergy);
    }
    if (enemy) {
      this.hud.updateEnemyHealth(enemy.health, enemy.maxHealth);
    }
    this.hud.updateCombo(
      this.combatSystem.getComboCount(),
      this.combatSystem.getComboDisplay()
    );
  }

  processPlayerAttack(action) {
    const enemy = this.getCurrentEnemy();
    if (!enemy || enemy.isDead) return;

    const result = this.combatSystem.processAttack(this.player, enemy, action.key);
    if (!result) return;

    audio.play(action.move.sound);

    if (result.hit) {
      enemy.takeDamage(result.damage, result.knockback, result.knockbackDir, result.hitstun);
      this.particles.spawnHitParticles(enemy.position);
      this.scene.shake(result.combo ? 0.4 : 0.2);

      if (result.combo) {
        audio.play(result.combo.sound);
        this.particles.spawnSpecialParticles(enemy.position);
        this.scene.shake(0.5);
      }

      if (result.isBlocking) {
        this.particles.spawnBlockParticles(enemy.position);
        audio.play('block');
      }

      if (action.key === 'l') {
        this.particles.spawnSpecialParticles(enemy.position);
        this.scene.shake(0.6);
      }
    }
  }

  processEnemyAttack(action) {
    if (!this.player || this.player.isDead) return;

    const enemy = this.getCurrentEnemy();
    if (!enemy) return;

    const dist = Math.abs(enemy.position.x - this.player.position.x);
    if (dist > action.move.range) return;

    if (this.player.isDodging || this.player.invincible) {
      return;
    }

    let damage = action.move.damage;
    const dir = Math.sign(this.player.position.x - enemy.position.x) || 1;

    if (this.player.isBlocking) {
      if (action.move.breaksBlock) {
        damage *= 0.5;
      } else {
        damage *= 0.25;
      }
      this.particles.spawnBlockParticles(this.player.position);
      audio.play('block');
    } else {
      audio.play(action.move.sound);
      this.particles.spawnHitParticles(this.player.position);
      this.scene.shake(0.15);
    }

    this.player.takeDamage(damage, action.move.knockback * 0.5, dir, this.player.isBlocking ? 0.1 : action.move.hitstun);

    // Give enemy energy
    enemy.energy = Math.min(100, enemy.energy + action.move.energyGain);
  }

  // --- Level completion ---

  onLevelComplete() {
    if (this.state !== STATES.PLAYING) return;

    audio.play('levelComplete');
    this.setState(STATES.LEVEL_COMPLETE);
    this.hud.hide();

    const config = this.levelManager.getCurrentConfig();
    const stats = this.combatSystem.getStats();
    const healthPct = this.player ? (this.player.health / this.player.maxHealth) * 100 : 0;

    this.dialogueBox.showDialogues(config.victoryDialogue, () => {
      this.showScoreScreen(stats, healthPct);
    });
  }

  showScoreScreen(stats, healthPct) {
    this.setState(STATES.SCORE_SCREEN);

    const config = this.levelManager.getCurrentConfig();
    const stars = this.levelManager.calculateStars(stats, healthPct);

    saveSystem.completeLevel(this.selectedCharacter, this.levelManager.currentLevelIndex, stars);

    document.getElementById('score-level-name').textContent = `${config.name}: ${config.title}`;
    document.getElementById('stat-damage').textContent = stats.damageDealt;
    document.getElementById('stat-combos').textContent = stats.combosLanded;
    const mins = Math.floor(stats.timeSeconds / 60);
    const secs = stats.timeSeconds % 60;
    document.getElementById('stat-time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('stat-health').textContent = `${Math.round(healthPct)}%`;

    for (let i = 1; i <= 3; i++) {
      document.getElementById(`star-${i}`).classList.toggle('earned', i <= stars);
    }

    this.scoreScreenEl.style.display = 'flex';
  }

  updateScoreScreen() {
    if (input.justPressed('enter')) {
      audio.play('menuSelect');
      this.scoreScreenEl.style.display = 'none';

      if (this.levelManager.hasNextLevel()) {
        this.startLevel(this.levelManager.currentLevelIndex + 1);
      } else {
        this.onVictory();
      }
    }
  }

  onGameOver() {
    this.setState(STATES.GAME_OVER);
    this.hud.hide();
    audio.stopMusic();
    audio.play('gameOver');

    this.gameOverEl.style.display = 'flex';
    this.gameOverSelectedIndex = 0;
    this.updateGameOverSelection();
  }

  updateGameOverSelection() {
    const options = this.gameOverEl.querySelectorAll('.gameover-option');
    options.forEach((opt, i) => {
      opt.classList.toggle('selected', i === this.gameOverSelectedIndex);
    });
  }

  updateGameOver() {
    const options = this.gameOverEl.querySelectorAll('.gameover-option');

    if (input.justPressed('arrowup') || input.justPressed('w')) {
      this.gameOverSelectedIndex = (this.gameOverSelectedIndex - 1 + options.length) % options.length;
      audio.play('menuSelect');
      this.updateGameOverSelection();
    }
    if (input.justPressed('arrowdown') || input.justPressed('s')) {
      this.gameOverSelectedIndex = (this.gameOverSelectedIndex + 1) % options.length;
      audio.play('menuSelect');
      this.updateGameOverSelection();
    }
    if (input.justPressed('enter')) {
      audio.play('menuSelect');
      this.gameOverEl.style.display = 'none';
      const action = options[this.gameOverSelectedIndex]?.dataset.action;
      if (action === 'retry') {
        this.startLevel(this.levelManager.currentLevelIndex);
      } else {
        this.onQuitToMenu();
      }
    }
  }

  onVictory() {
    this.setState(STATES.VICTORY);
    this.hud.hide();
    this.cleanupLevel();
    audio.stopMusic();
    audio.play('levelComplete');

    const charName = this.selectedCharacter === 'neo' ? 'Neo' : 'Agent Smith';
    document.getElementById('victory-message').innerHTML =
      `You have completed ${charName}'s journey.<br>The Matrix will never be the same.`;

    this.victoryScreenEl.style.display = 'flex';
  }

  updateVictory() {
    if (input.justPressed('enter')) {
      audio.play('menuSelect');
      this.victoryScreenEl.style.display = 'none';
      this.onQuitToMenu();
    }
  }

  render() {
    if (this.state === STATES.PLAYING || this.state === STATES.PAUSED ||
        this.state === STATES.LEVEL_COMPLETE || this.state === STATES.STORY_INTRO ||
        this.state === STATES.STORY_DIALOGUE || this.state === STATES.SCORE_SCREEN ||
        this.state === STATES.GAME_OVER) {
      this.scene.render();
    }
  }
}
