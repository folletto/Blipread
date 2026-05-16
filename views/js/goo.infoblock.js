import {goo} from './goo.js';

export class InfoBlock {
  constructor(data) {
    this.label = data.label;
    this.value = data.value;
  }

  render() {
    return `
      <span class="label">${this.label}</span>
      <span class="value">${this.value}</span>
    `;
  }
}
