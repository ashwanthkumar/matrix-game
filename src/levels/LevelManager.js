import { getLevels } from './levels.js';
import { buildDojo } from './environments/Dojo.js';
import { buildOffice } from './environments/Office.js';
import { buildLobby } from './environments/Lobby.js';
import { buildRooftop } from './environments/Rooftop.js';
import { buildSubway } from './environments/Subway.js';
import { buildHighway } from './environments/Highway.js';
import { buildPark } from './environments/Park.js';
import { buildServerRoom } from './environments/ServerRoom.js';
import { buildCityStreet } from './environments/CityStreet.js';
import { buildConstruct } from './environments/Construct.js';

const ENVIRONMENT_BUILDERS = {
  dojo: () => buildDojo(),
  office: () => buildOffice(),
  lobby: () => buildLobby(),
  rooftop: () => buildRooftop(),
  subway: () => buildSubway(),
  highway: () => buildHighway(),
  park: () => buildPark(),
  serverRoom: () => buildServerRoom(),
  cityStreet: () => buildCityStreet(),
  construct: () => buildConstruct(false),
  constructDark: () => buildConstruct(true),
};

export class LevelManager {
  constructor(gameScene) {
    this.gameScene = gameScene;
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.character = 'neo';
    this.levels = [];
    this.environmentData = null;
  }

  setCharacter(character) {
    this.character = character;
    this.levels = getLevels(character);
  }

  getLevelCount() {
    return this.levels.length;
  }

  getLevelConfig(index) {
    return this.levels[index] || null;
  }

  getCurrentConfig() {
    return this.getLevelConfig(this.currentLevelIndex);
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    const config = this.getLevelConfig(index);
    if (!config) return null;

    // Build new environment (returns { draw, bounds, playerStart, enemyStart })
    const builder = ENVIRONMENT_BUILDERS[config.environment];
    if (!builder) {
      console.warn(`No environment builder for: ${config.environment}`);
      return config;
    }

    this.environmentData = builder();

    // Tell the scene about the new environment
    this.gameScene.setEnvironment(this.environmentData);

    return config;
  }

  getEnvironmentData() {
    return this.environmentData;
  }

  getPlayerStart() {
    if (this.environmentData?.playerStart) {
      return this.environmentData.playerStart;
    }
    return { x: 400 };
  }

  getEnemyStart() {
    if (this.environmentData?.enemyStart) {
      return this.environmentData.enemyStart;
    }
    return { x: 880 };
  }

  getBounds() {
    if (this.environmentData?.bounds) {
      return this.environmentData.bounds;
    }
    return { minX: 100, maxX: 1180 };
  }

  hasNextLevel() {
    return this.currentLevelIndex < this.levels.length - 1;
  }

  nextLevel() {
    if (this.hasNextLevel()) {
      this.currentLevelIndex++;
      return this.loadLevel(this.currentLevelIndex);
    }
    return null;
  }

  unloadLevel() {
    this.environmentData = null;
    this.gameScene.setEnvironment(null);
  }

  calculateStars(stats, playerHealthPercent) {
    let stars = 1;
    if (playerHealthPercent >= 50) stars++;
    if (stats.combosLanded >= 3 && stats.timeSeconds < 300) stars++;
    return stars;
  }
}
