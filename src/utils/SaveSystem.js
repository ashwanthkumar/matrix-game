const SAVE_KEY = 'matrix_reloaded_save';

export class SaveSystem {
  constructor() {
    this.data = this.load();
  }

  getDefault() {
    return {
      neo: { currentLevel: 0, completed: [], stars: {} },
      smith: { currentLevel: 0, completed: [], stars: {} },
      settings: { sfxVolume: 0.6, musicVolume: 0.15 },
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return this.getDefault();
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  completeLevel(character, levelIndex, stars) {
    const charData = this.data[character];
    if (!charData) return;

    if (!charData.completed.includes(levelIndex)) {
      charData.completed.push(levelIndex);
    }

    const prev = charData.stars[levelIndex] || 0;
    charData.stars[levelIndex] = Math.max(prev, stars);

    if (levelIndex >= charData.currentLevel) {
      charData.currentLevel = levelIndex + 1;
    }

    this.save();
  }

  getCurrentLevel(character) {
    return this.data[character]?.currentLevel || 0;
  }

  hasSaveData(character) {
    return (this.data[character]?.currentLevel || 0) > 0;
  }

  hasAnySave() {
    return this.hasSaveData('neo') || this.hasSaveData('smith');
  }

  reset() {
    this.data = this.getDefault();
    this.save();
  }
}

export const saveSystem = new SaveSystem();
