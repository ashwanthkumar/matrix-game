import { input } from '../utils/Input.js';
import { audio } from '../utils/Audio.js';
import { saveSystem } from '../utils/SaveSystem.js';

export class MainMenu {
  constructor(onStart, onContinue) {
    this.el = document.getElementById('main-menu');
    this.onStart = onStart;
    this.onContinue = onContinue;

    this.options = this.el.querySelectorAll('.menu-option');
    this.selectedIndex = 0;
    this.active = false;

    // Credits overlay
    this.creditsEl = document.getElementById('credits-overlay');
    this.creditsActive = false;

    // Click/tap support
    this.options.forEach((opt) => {
      opt.addEventListener('click', () => {
        if (!this.active) return;
        audio.play('menuSelect');
        this._selectAction(opt.dataset.action);
      });
    });

    // Close credits on click/tap
    if (this.creditsEl) {
      this.creditsEl.addEventListener('click', () => {
        if (this.creditsActive) this._hideCredits();
      });
    }
  }

  show() {
    this.el.style.display = 'flex';
    this.active = true;
    this.selectedIndex = 0;

    // Hide continue if no save data
    const continueOption = this.el.querySelector('[data-action="continue"]');
    if (saveSystem.hasAnySave()) {
      continueOption.style.display = 'block';
    } else {
      continueOption.style.display = 'none';
    }

    this.updateSelection();
  }

  hide() {
    this.el.style.display = 'none';
    this.active = false;
    if (this.creditsActive) this._hideCredits();
  }

  updateSelection() {
    const visibleOptions = [...this.options].filter(o => o.style.display !== 'none');
    visibleOptions.forEach((opt, i) => {
      opt.classList.toggle('selected', i === this.selectedIndex);
    });
  }

  _selectAction(action) {
    if (action === 'start') this.onStart();
    else if (action === 'continue') this.onContinue();
    else if (action === 'credits') this._showCredits();
  }

  _showCredits() {
    if (!this.creditsEl) return;
    this.creditsActive = true;
    this.creditsEl.classList.add('active');
  }

  _hideCredits() {
    if (!this.creditsEl) return;
    this.creditsActive = false;
    this.creditsEl.classList.add('fade-out');
    setTimeout(() => {
      this.creditsEl.classList.remove('active', 'fade-out');
    }, 300);
  }

  update() {
    if (!this.active) return;

    // Credits overlay intercepts input
    if (this.creditsActive) {
      if (input.justPressed('escape') || input.justPressed('enter')) {
        audio.play('menuSelect');
        this._hideCredits();
      }
      return;
    }

    const visibleOptions = [...this.options].filter(o => o.style.display !== 'none');

    if (input.justPressed('arrowup') || input.justPressed('w')) {
      this.selectedIndex = (this.selectedIndex - 1 + visibleOptions.length) % visibleOptions.length;
      audio.play('menuSelect');
      this.updateSelection();
    }

    if (input.justPressed('arrowdown') || input.justPressed('s')) {
      this.selectedIndex = (this.selectedIndex + 1) % visibleOptions.length;
      audio.play('menuSelect');
      this.updateSelection();
    }

    if (input.justPressed('enter')) {
      audio.play('menuSelect');
      const action = visibleOptions[this.selectedIndex]?.dataset.action;
      this._selectAction(action);
    }
  }
}
