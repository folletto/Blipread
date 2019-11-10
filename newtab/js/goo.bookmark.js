import {goo} from './goo.js';

export class Bookmark {
  constructor(bookmark) {
    this.bookmark = bookmark;
  }

  render() {
    let special = '';
    let url = new URL(this.bookmark.url);
    if (url.protocol === 'chrome:') {
      special = goo.onClick(this.onClickChromeURL.bind(this));
    }

    return `
      <a href="${this.bookmark.url}" ${special}>
        <span class="bookmark__img"><img src="chrome://favicon/size/16@2x/${this.bookmark.url}" /></span>
        <span class="bookmark__label">${this.bookmark.title}</span>
      </a>
    `;
  }

  onClickChromeURL(event) {
    let self = this;

    // Necessary workaround due to Chrome security locks on `chrome:` urls
    // See: https://github.com/folletto/Bliphome/issues/2
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.update(tab.id, {url: self.bookmark.url});
    });

    event.preventDefault();
  }
}
