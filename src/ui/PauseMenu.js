import { input } from '../utils/Input.js';
import { audio } from '../utils/Audio.js';

export class PauseMenu {
  constructor(onResume, onRestart, onQuit) {
    this.el = document.getElementById('pause-menu');
    this.onResume = onResume;
    this.onRestart = onRestart;
    this.onQuit = onQuit;

    this.options = this.el.querySelectorAll('.pause-option');
    this.selectedIndex = 0;
    this.active = false;

    // Click/tap support
    this.options.forEach((opt) => {
      opt.addEventListener('click', () => {
        if (!this.active) return;
        audio.play('menuSelect');
        const action = opt.dataset.action;
        if (action === 'resume') this.onResume();
        else if (action === 'restart') this.onRestart();
        else if (action === 'quit') this.onQuit();
      });
    });
  }

  show() {
    this.el.style.display = 'flex';
    this.active = true;
    this.selectedIndex = 0;
    this.updateSelection();
  }

  hide() {
    this.el.style.display = 'none';
    this.active = false;
  }

  updateSelection() {
    this.options.forEach((opt, i) => {
      opt.classList.toggle('selected', i === this.selectedIndex);
    });
  }

  update() {
    if (!this.active) return;

    if (input.justPressed('arrowup') || input.justPressed('w')) {
      this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
      audio.play('menuSelect');
      this.updateSelection();
    }

    if (input.justPressed('arrowdown') || input.justPressed('s')) {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
      audio.play('menuSelect');
      this.updateSelection();
    }

    if (input.justPressed('enter')) {
      audio.play('menuSelect');
      const action = this.options[this.selectedIndex]?.dataset.action;
      if (action === 'resume') this.onResume();
      else if (action === 'restart') this.onRestart();
      else if (action === 'quit') this.onQuit();
    }

    if (input.justPressed('escape')) {
      this.onResume();
    }
  }
}
