import { Game } from './game/Game.js';
import { audio } from './utils/Audio.js';

// Boot up the Matrix
const game = new Game();

// Handle first user interaction to unlock audio
const unlockAudio = () => {
  audio.init();
  audio.resume();
};
document.addEventListener('keydown', unlockAudio, { once: true });
document.addEventListener('click', unlockAudio, { once: true });

// Initialize game
game.init().catch(err => {
  console.error('Failed to initialize game:', err);
});
