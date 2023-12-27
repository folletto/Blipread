import {goo} from './goo.js';
import {Toolbar} from './goo.toolbar.js';

const AVERAGE_READING_SPEED = 200;
const COLOR_DEFAULT = "606368";
const COLOR_SET = {
  'Light': "f2f3f4",
  'Dark': COLOR_DEFAULT
};

export class Options {
  constructor() {
    this.readingSpeed = AVERAGE_READING_SPEED;
    this.colorManual = COLOR_DEFAULT;

    chrome.storage.sync.get(null, function(data) {
      if (data.readingSpeed > 0) {
        this.readingSpeed = data.readingSpeed;
      }
      this.colorManual = data.colorManual;
      goo.refresh(this);
    }.bind(this));
  }

  render() {
    return `
      ${goo.render(Toolbar)}
      <div class="basic-page">
        <h2>Options</h2>
        <card>
          <div class="card-row">
            <label>Reading speed (<a href="https://en.wikipedia.org/wiki/Words_per_minute">wpm</a>)</label>
            <div class="content">
              <input id="readingSpeed" type="number" value="${this.getReadingSpeed()}" />
            </div>
          </div>
          <div class="card-row">
            <label>Label color</label>
            <div class="content">
              ${this.renderColorSet()}
            </div>
          </div>
          <div class="card-row">
            <div class="content">
              <button class="card-button" ${goo.onClick(this.onClickSave.bind(this))}>Save options</button>
            </div>
          </div>
        </card>
        <h2>Info</h2>
        <card>
          <div class="card-row">
            <label>
              The average reading speed is between 150 and 210.<br />
              To measure your reading speed, check online one of the many reading speed calculators in wpm.
            </label>
          </div>
        </card>
      </div>
    `;
  }

  getReadingSpeed() {
    return this.readingSpeed;
  }

  renderColorSet() {
    let htmlColorSet = "";
    if (this.colorManual == "") this.colorManual = COLOR_DEFAULT;

    for (let key in COLOR_SET) {
      htmlColorSet += `<option value="${COLOR_SET[key]}" ${COLOR_SET[key] == this.colorManual ? 'selected' : ''}>${key}</option>`;
    }

    return '<select id="colorManual">' + htmlColorSet + '</select>';
  }

  onClickSave() {
    let readingSpeed = document.getElementById('readingSpeed').value;
    chrome.storage.sync.set({'readingSpeed': readingSpeed});
    console.log("Saved readingSpeed: " + readingSpeed);

    let colorManual = document.getElementById('colorManual').value;
    chrome.storage.sync.set({'colorManual': colorManual});
    console.log("Saved colorManual: " + colorManual);
  }
}
