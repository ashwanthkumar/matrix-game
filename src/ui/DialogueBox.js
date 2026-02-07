import { input } from '../utils/Input.js';

export class DialogueBox {
  constructor() {
    this.el = document.getElementById('dialogue-box');
    this.speakerEl = document.getElementById('speaker-name');
    this.textEl = document.getElementById('dialogue-text');
    this.active = false;
    this.dialogues = [];
    this.currentIndex = 0;
    this.charIndex = 0;
    this.typeTimer = 0;
    this.typeSpeed = 0.03; // seconds per character
    this.currentText = '';
    this.fullText = '';
    this.finished = false;
    this.onComplete = null;

    // Click/tap to advance dialogue
    this.el.addEventListener('click', () => {
      if (!this.active) return;
      if (!this.finished) {
        this.currentText = this.fullText;
        this.textEl.textContent = this.currentText;
        this.charIndex = this.fullText.length;
        this.finished = true;
      } else {
        this.currentIndex++;
        if (this.currentIndex >= this.dialogues.length) {
          this.hide();
          if (this.onComplete) this.onComplete();
        } else {
          this.showCurrentLine();
        }
      }
    });
  }

  showDialogues(dialogues, onComplete) {
    if (!dialogues || dialogues.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    this.dialogues = dialogues;
    this.currentIndex = 0;
    this.onComplete = onComplete;
    this.active = true;
    this.el.style.display = 'block';
    this.showCurrentLine();
  }

  showCurrentLine() {
    const line = this.dialogues[this.currentIndex];
    this.speakerEl.textContent = line.speaker;
    this.fullText = line.text;
    this.currentText = '';
    this.charIndex = 0;
    this.typeTimer = 0;
    this.finished = false;
    this.textEl.textContent = '';
  }

  hide() {
    this.el.style.display = 'none';
    this.active = false;
  }

  update(dt) {
    if (!this.active) return;

    // Type out text
    if (!this.finished) {
      this.typeTimer += dt;
      while (this.typeTimer >= this.typeSpeed && this.charIndex < this.fullText.length) {
        this.typeTimer -= this.typeSpeed;
        this.charIndex++;
        this.currentText = this.fullText.substring(0, this.charIndex);
        this.textEl.textContent = this.currentText;
      }
      if (this.charIndex >= this.fullText.length) {
        this.finished = true;
      }
    }

    // Advance on Enter
    if (input.justPressed('enter')) {
      if (!this.finished) {
        // Skip to end of current line
        this.currentText = this.fullText;
        this.textEl.textContent = this.currentText;
        this.charIndex = this.fullText.length;
        this.finished = true;
      } else {
        // Next line
        this.currentIndex++;
        if (this.currentIndex >= this.dialogues.length) {
          this.hide();
          if (this.onComplete) this.onComplete();
        } else {
          this.showCurrentLine();
        }
      }
    }
  }
}
