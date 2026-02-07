export class Input {
  constructor() {
    this.keys = new Set();
    this.justPressedKeys = new Set();
    this.justReleasedKeys = new Set();

    // Mobile detection
    this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);

    // Touch state
    this._atkComboCount = 0;
    this._atkLastTapTime = 0;
    this._atkCurrentKey = null;
    this._atkResetTimer = null;
    this._defTouchStart = 0;
    this._defIsHolding = false;
    this._defTimer = null;

    // Joystick state
    this._joystickActive = false;
    this._joystickTouchId = null;
    this._joystickOrigin = { x: 0, y: 0 };
    this._joystickX = 0;

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) {
        this.justPressedKeys.add(key);
      }
      this.keys.add(key);
      if (['arrowup','arrowdown','arrowleft','arrowright',' ','i','j','k','l'].includes(key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      this.justReleasedKeys.add(key);
    });

    if (this.isMobile) {
      document.body.classList.add('mobile');
      this._initTouch();
    }
  }

  _initTouch() {
    const controls = document.getElementById('touch-controls');
    if (!controls) return;

    // Bind ATK, DEF, Pause buttons
    const buttons = controls.querySelectorAll('.touch-btn');
    buttons.forEach(btn => {
      const action = btn.dataset.touch;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.classList.add('pressed');
        this._handleTouchStart(action);
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
        this._handleTouchEnd(action);
      }, { passive: false });

      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
        this._handleTouchEnd(action);
      }, { passive: false });
    });

    // Bind joystick
    this._initJoystick();
  }

  _initJoystick() {
    const zone = document.getElementById('joystick-zone');
    const base = document.getElementById('joystick-base');
    const thumb = document.getElementById('joystick-thumb');
    if (!zone || !base || !thumb) return;

    const RADIUS = 40;
    const DEADZONE = 0.3;

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this._joystickActive) return;

      const touch = e.changedTouches[0];
      this._joystickTouchId = touch.identifier;
      this._joystickActive = true;

      const rect = base.getBoundingClientRect();
      this._joystickOrigin.x = rect.left + rect.width / 2;
      this._joystickOrigin.y = rect.top + rect.height / 2;

      this._updateJoystick(touch.clientX, thumb, RADIUS, DEADZONE);
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this._joystickActive) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this._joystickTouchId) {
          this._updateJoystick(touch.clientX, thumb, RADIUS, DEADZONE);
          break;
        }
      }
    }, { passive: false });

    const endJoystick = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this._joystickTouchId) {
          this._joystickActive = false;
          this._joystickTouchId = null;
          this._joystickX = 0;
          thumb.style.transform = 'translate(0px, 0px)';
          this.releaseKey('a');
          this.releaseKey('d');
          break;
        }
      }
    };

    zone.addEventListener('touchend', endJoystick, { passive: false });
    zone.addEventListener('touchcancel', endJoystick, { passive: false });
  }

  _updateJoystick(clientX, thumb, radius, deadzone) {
    let dx = clientX - this._joystickOrigin.x;
    dx = Math.max(-radius, Math.min(radius, dx));

    this._joystickX = dx / radius;

    thumb.style.transform = `translate(${dx}px, 0px)`;

    if (this._joystickX < -deadzone) {
      this.pressKey('a');
      this.releaseKey('d');
    } else if (this._joystickX > deadzone) {
      this.pressKey('d');
      this.releaseKey('a');
    } else {
      this.releaseKey('a');
      this.releaseKey('d');
    }
  }

  _handleTouchStart(action) {
    switch (action) {
      case 'atk':
        this._handleAtkStart();
        break;
      case 'def':
        this._handleDefStart();
        break;
      case 'pause':
        this.pressKey('escape');
        break;
    }
  }

  _handleTouchEnd(action) {
    switch (action) {
      case 'atk':
        this._handleAtkEnd();
        break;
      case 'def':
        this._handleDefEnd();
        break;
      case 'pause':
        this.releaseKey('escape');
        break;
    }
  }

  _handleAtkStart() {
    const now = Date.now();
    if (this._atkResetTimer) {
      clearTimeout(this._atkResetTimer);
      this._atkResetTimer = null;
    }

    if (now - this._atkLastTapTime < 600) {
      this._atkComboCount++;
    } else {
      this._atkComboCount = 1;
    }
    this._atkLastTapTime = now;

    // Cycle: 1=punch, 2=kick, 3=special, then reset
    const comboStep = ((this._atkComboCount - 1) % 3) + 1;
    if (comboStep === 1) {
      this._atkCurrentKey = 'j';
    } else if (comboStep === 2) {
      this._atkCurrentKey = 'k';
    } else {
      this._atkCurrentKey = 'l';
    }

    this.pressKey(this._atkCurrentKey);
  }

  _handleAtkEnd() {
    if (this._atkCurrentKey) {
      this.releaseKey(this._atkCurrentKey);
      this._atkCurrentKey = null;
    }

    // Reset combo after 800ms idle
    this._atkResetTimer = setTimeout(() => {
      this._atkComboCount = 0;
    }, 800);
  }

  _handleDefStart() {
    this._defTouchStart = Date.now();
    this._defIsHolding = false;

    // Start blocking immediately
    this.pressKey('i');

    // After 200ms, confirm it's a hold (block)
    this._defTimer = setTimeout(() => {
      this._defIsHolding = true;
    }, 200);
  }

  _handleDefEnd() {
    if (this._defTimer) {
      clearTimeout(this._defTimer);
      this._defTimer = null;
    }

    const elapsed = Date.now() - this._defTouchStart;

    // Release block
    this.releaseKey('i');

    if (elapsed < 200) {
      // Quick tap = dodge
      this.pressKey(' ');
      setTimeout(() => this.releaseKey(' '), 50);
    }
    this._defIsHolding = false;
  }

  // Programmatic key press/release (used by touch)
  pressKey(key) {
    if (!this.keys.has(key)) {
      this.justPressedKeys.add(key);
    }
    this.keys.add(key);
  }

  releaseKey(key) {
    this.keys.delete(key);
    this.justReleasedKeys.add(key);
  }

  isPressed(key) { return this.keys.has(key); }
  justPressed(key) { return this.justPressedKeys.has(key); }
  justReleased(key) { return this.justReleasedKeys.has(key); }

  // Call at end of each frame
  update() {
    this.justPressedKeys.clear();
    this.justReleasedKeys.clear();
  }

  // Movement helpers
  get moveForward() { return this.isPressed('w') || this.isPressed('arrowup'); }
  get moveBackward() { return this.isPressed('s') || this.isPressed('arrowdown'); }
  get moveLeft() { return this.isPressed('a') || this.isPressed('arrowleft'); }
  get moveRight() { return this.isPressed('d') || this.isPressed('arrowright'); }
}

export const input = new Input();
