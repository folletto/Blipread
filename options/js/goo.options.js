import {goo} from './goo.js';
import {Toolbar} from './goo.toolbar.js';

const AVERAGE_READING_SPEED = 200;

export class Options {
  constructor() {
    this.readingSpeed = AVERAGE_READING_SPEED;

    chrome.storage.sync.get(null, function(data) {
      if (data.readingSpeed > 0) {
        this.readingSpeed = data.readingSpeed;
      }
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
              To measure your reading speed, you can use <a href="https://www.myreadspeed.com/calculate/">this website</a>.
            </label>
          </div>
        </card>
      </div>
    `;
  }

  getReadingSpeed() {
    return this.readingSpeed;
  }

  onClickSave() {
    let readingSpeed = document.getElementById('readingSpeed').value;
    chrome.storage.sync.set({'readingSpeed': readingSpeed});
    console.log("Saved readingSpeed: " + readingSpeed);
  }
}
