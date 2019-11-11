/*
 * Blipread: internal process
 */

class Blipread {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    this.readingSpeed = 200; // Average reading speed
    chrome.storage.sync.get('readingSpeed', function(data) {
      this.readingSpeed = data.readingSpeed;
    }.bind(this));
    chrome.storage.onChanged.addListener(this.onOptionsChange.bind(this));
    //chrome.storage.sync.set({'readingSpeed': 250});

    // Update when the page ends loading
    chrome.runtime.onMessage.addListener(this.onContentUpdate.bind(this));
    // Update when switching tabs
    chrome.tabs.onActivated.addListener(this.executeContentScript.bind(this));
    // Run on icon click
    chrome.browserAction.onClicked.addListener((function(tab) { this.executeContentScript(); }).bind(this) );
  }

  executeContentScript() {
    this.setExtensionIcon("·");
    chrome.tabs.executeScript(null, {file: "js/content.js", runAt: "document_end"});
  }

  onContentUpdate(request, sender, sendResponse) {
    let label = Math.ceil(request.contentLength / this.readingSpeed) + "′";
    this.setExtensionIcon(label);
  }

  onOptionsChange(changes, areaName) {
    if (changes.readingSpeed) this.readingSpeed = changes.readingSpeed.newValue;
  }

  setExtensionIcon(label) {
    this.canvas.width = 32;
    this.canvas.height = 32;

    this.context.font = "23px Helvetica";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "#000000";
    this.context.fillText(label, 17, 17);

    chrome.browserAction.setIcon({
      imageData: this.context.getImageData(0, 0, 32, 32)
    });
  }
}

let blipread = new Blipread();
