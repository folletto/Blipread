import {goo} from './goo.js';
import {Toolbar} from './goo.toolbar.js';

export class Options {
  constructor() {
    this.readingSpeed = 200;

    chrome.storage.sync.get('readingSpeed', function(data) {
      this.readingSpeed = data.readingSpeed;
      console.log(data.readingSpeed);
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
            <label>Reading speed</label>
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
