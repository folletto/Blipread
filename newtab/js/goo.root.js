import {goo} from './goo.js';
import {Bookmark} from './goo.bookmark.js';
import {Motivational} from './goo.motivational.js';

const BOOKMARKS_FOLDER_NAME = 'New tab'; // case insensitive
const STATUS_FOLDER_FOUND = Symbol('New tab folder found');
const STATUS_FOLDER_MISSING = Symbol('Folder missing');

export class Root {
  constructor() {
    this.bookmarkFolderNewTab = null;
    this.loadStatus = null;
    this.countTest = 0;
  }

  render() {
    return `
      <div class="shelf">${this.renderBookmarks()}</div>
      ${goo.render(Motivational)}
    `;
  }

  renderBookmarks() {
    let out = '';

    if (this.bookmarkFolderNewTab == null) {
      if (this.loadStatus == STATUS_FOLDER_MISSING) {
        out = this.renderFolderIsMissing();
      } else {
        this.getBookmarks();
      }
    } else {
      if (this.bookmarkFolderNewTab.children.length == 0) {
        out = this.renderFolderIsEmpty();
      } else {
        for (let bookmark of this.bookmarkFolderNewTab.children) {
          if (!bookmark.children) {
            out += goo.render(Bookmark, bookmark);
          }
        }
      }
    }

    return out;
  }

  getBookmarks() {
    var self = this;
    this.loadStatus = null;

    chrome.bookmarks.getTree(function(bookmarks) {
      let bookmarkFolderNewTab = self.searchBookmarksFolder(BOOKMARKS_FOLDER_NAME, bookmarks);
      if (bookmarkFolderNewTab) {
        if (bookmarkFolderNewTab.children) {
          self.bookmarkFolderNewTab = bookmarkFolderNewTab;

          if (bookmarkFolderNewTab.children.length > 0) {
            self.loadStatus = STATUS_FOLDER_FOUND;
          }
        }
      } else {
        self.loadStatus = STATUS_FOLDER_MISSING;

        // Create bookmark folder then!
        chrome.bookmarks.create(
          { title: BOOKMARKS_FOLDER_NAME },
          () => {
            self.loadStatus = STATUS_FOLDER_FOUND;
            goo.refresh(self);
          }
        );
      }

      goo.refresh(self);
    });
  }

  renderFolderIsMissing() {
    return `
      <div class="root__error">
        <p>
          No bookmark folder name '${BOOKMARKS_FOLDER_NAME}' found.<br/>
          Open the Bookmarks Manager and create one.
        </p>
        <button class="mdc-button" ${goo.onClick(this.onClickBookmarksManager.bind(this))}>Open bookmarks manager</button>
      </div>
    `;
  }

  renderFolderIsEmpty() {
    return `
      <div class="root__error">
        <p>
          The bookmark folder '${BOOKMARKS_FOLDER_NAME}' is empty.<br/>
          Open the Bookmarks Manager and add new bookmarks inside '${BOOKMARKS_FOLDER_NAME}'.
        </p>
        <button class="mdc-button" ${goo.onClick(this.onClickBookmarksManager.bind(this))}>Open bookmarks manager</button>
      </div>
    `;
  }

  onClickBookmarksManager(event) {
    let bookmarkFolderId = null;
    if (this.bookmarkFolderNewTab) bookmarkFolderId = this.bookmarkFolderNewTab.id;

    // Necessary workaround due to Chrome security locks on `chrome:` urls
    chrome.tabs.getCurrent(function(tab) {
      chrome.tabs.update(tab.id, {url: 'chrome://bookmarks/?id=' + bookmarkFolderId});
    });
  }

  searchBookmarksFolder(name, root) {
    var out;
    for (let item of root) {
      if (item.title.toLowerCase() == name.toLowerCase()) {
        out = item;
        break;
      } else if (item.children && item.children.length > 0) {
        out = this.searchBookmarksFolder(name, item.children);
        if (out) break;
      }
    }
    return out;
  }
}
