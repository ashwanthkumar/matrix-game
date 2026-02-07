export class PostProcessing {
  constructor(renderer) {
    this.renderer = renderer;
    this.greenTintEnabled = true;
    this.bloomEnabled = true;

    this.canvas = renderer.domElement;
    this.updateFilters();
  }

  updateFilters() {
    const filters = [];
    if (this.greenTintEnabled) {
      // Very subtle green tint - just enough to feel Matrix-like without killing brightness
      filters.push('sepia(8%)');
      filters.push('hue-rotate(70deg)');
      filters.push('saturate(115%)');
    }
    if (this.bloomEnabled) {
      filters.push('contrast(102%)');
      filters.push('brightness(115%)');
    }
    this.canvas.style.filter = filters.join(' ');
  }

  setGreenTint(enabled) {
    this.greenTintEnabled = enabled;
    this.updateFilters();
  }

  setBloom(enabled) {
    this.bloomEnabled = enabled;
    this.updateFilters();
  }

  setBulletTimeEffect(active) {
    if (active) {
      this.canvas.style.filter = 'sepia(12%) hue-rotate(70deg) saturate(130%) contrast(108%) brightness(95%)';
    } else {
      this.updateFilters();
    }
  }

  dispose() {
    this.canvas.style.filter = '';
  }
}
