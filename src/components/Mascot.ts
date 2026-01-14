import type { MascotState } from '../types';

export class Mascot {
  private element: HTMLDivElement;
  private state: MascotState = 'idle';

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ec-mascot ec-mascot--idle';
    this.element.innerHTML = this.getRobotSvg();
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  setState(state: MascotState): void {
    this.state = state;
    this.element.className = `ec-mascot ec-mascot--${state}`;
  }

  getState(): MascotState {
    return this.state;
  }

  private getRobotSvg(): string {
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Antenna -->
        <line x1="50" y1="15" x2="50" y2="5" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="5" r="4" fill="#FFD700"/>

        <!-- Head -->
        <rect x="25" y="15" width="50" height="40" rx="8" fill="#fff"/>

        <!-- Eyes -->
        <g class="ec-mascot-eyes">
          <circle cx="38" cy="35" r="8" fill="#333"/>
          <circle cx="62" cy="35" r="8" fill="#333"/>
          <circle cx="40" cy="33" r="3" fill="#fff"/>
          <circle cx="64" cy="33" r="3" fill="#fff"/>
        </g>

        <!-- Mouth -->
        <rect x="40" y="45" width="20" height="4" rx="2" fill="#333"/>

        <!-- Body -->
        <rect x="30" y="58" width="40" height="30" rx="6" fill="#fff"/>

        <!-- Chest light -->
        <circle cx="50" cy="70" r="6" fill="#4CAF50"/>
        <circle cx="50" cy="70" r="3" fill="#81C784"/>

        <!-- Arms -->
        <g class="ec-mascot-arm ec-mascot-arm-left">
          <rect x="15" y="60" width="12" height="20" rx="4" fill="#fff"/>
        </g>
        <g class="ec-mascot-arm ec-mascot-arm-right">
          <rect x="73" y="60" width="12" height="20" rx="4" fill="#fff"/>
        </g>

        <!-- Feet -->
        <rect x="32" y="88" width="14" height="8" rx="3" fill="#fff"/>
        <rect x="54" y="88" width="14" height="8" rx="3" fill="#fff"/>
      </svg>
    `;
  }
}

// Smaller version for header (full robot)
export class MascotSmall {
  private element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'ec-header-mascot';
    this.element.innerHTML = this.getRobotSvg();
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  private getRobotSvg(): string {
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Antenna -->
        <line x1="50" y1="15" x2="50" y2="5" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="50" cy="5" r="4" fill="#FFD700"/>

        <!-- Head -->
        <rect x="25" y="15" width="50" height="40" rx="8" fill="#fff"/>

        <!-- Eyes -->
        <g class="ec-mascot-eyes">
          <circle cx="38" cy="35" r="8" fill="#333"/>
          <circle cx="62" cy="35" r="8" fill="#333"/>
          <circle cx="40" cy="33" r="3" fill="#fff"/>
          <circle cx="64" cy="33" r="3" fill="#fff"/>
        </g>

        <!-- Mouth smile -->
        <path d="M 40 48 Q 50 54 60 48" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>

        <!-- Body -->
        <rect x="30" y="58" width="40" height="30" rx="6" fill="#fff"/>

        <!-- Chest light -->
        <circle cx="50" cy="70" r="6" fill="#4CAF50"/>
        <circle cx="50" cy="70" r="3" fill="#81C784"/>

        <!-- Arms -->
        <rect x="15" y="60" width="12" height="20" rx="4" fill="#fff"/>
        <rect x="73" y="60" width="12" height="20" rx="4" fill="#fff"/>

        <!-- Feet -->
        <rect x="32" y="88" width="14" height="8" rx="3" fill="#fff"/>
        <rect x="54" y="88" width="14" height="8" rx="3" fill="#fff"/>
      </svg>
    `;
  }
}
