import {goo} from './goo.js';
import {InfoBlock} from './goo.infoblock.js';

export class Popup {
  constructor() {
    this.pageTime = null;
    this.selectionTime = null;

    chrome.runtime.onMessage.addListener((request) => {
      if (request.pageEval) {
        this.pageTime = request.pageEval.pageTime;
        this.selectionTime = request.pageEval.selectionTime;
        goo.refresh(this);
      }
    });

    chrome.runtime.sendMessage({ requestRefresh: true }).catch(() => {});
  }

  formatTime(totalMinutes) {
    if (totalMinutes <= 1) return `~${totalMinutes} m`;
    if (totalMinutes < 60) return `${totalMinutes} m`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  }

  render() {
    if (this.pageTime === null) {
      return `
        <div class="loading">
          <svg width="8" height="8" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" fill="#dadce0"/>
          </svg>
        </div>
      `;
    }

    const hasSelection = this.selectionTime > 0;

    return `
      ${goo.render(InfoBlock, { label: 'Page reading time', value: this.formatTime(this.pageTime) })}
      ${hasSelection ? goo.render(InfoBlock, { label: 'Selection reading time', value: this.formatTime(this.selectionTime) }) : ''}
    `;
  }
}
