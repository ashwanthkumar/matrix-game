export class LoadingScreen {
  constructor() {
    this.el = document.getElementById('loading-screen');
    this.textEl = this.el.querySelector('.loading-text');
    this.subtextEl = this.el.querySelector('.loading-subtext');
    this.fillEl = this.el.querySelector('.progress-bar-fill');
  }

  show(text = 'LOADING THE MATRIX...') {
    this.textEl.textContent = text;
    this.subtextEl.textContent = 'Initializing...';
    this.fillEl.style.width = '0%';
    this.el.style.display = 'flex';
  }

  hide() {
    this.el.style.display = 'none';
  }

  setProgress(loaded, total) {
    const pct = total > 0 ? (loaded / total) * 100 : 0;
    this.fillEl.style.width = `${pct}%`;
    this.subtextEl.textContent = `Loading assets... ${loaded}/${total}`;
  }

  setText(text) {
    this.subtextEl.textContent = text;
  }

  async simulateProgress(durationMs = 800) {
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      this.fillEl.style.width = `${(i / steps) * 100}%`;
      await new Promise(r => setTimeout(r, durationMs / steps));
    }
  }
}
