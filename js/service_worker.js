/*
 * Blipread: internal process
 */

const AVERAGE_READING_SPEED = 200;
const COLOR_DEFAULT = "";

class Blipread {
  constructor() {
    this.readingSpeed = AVERAGE_READING_SPEED; // Average reading speed
    this.colorManual = COLOR_DEFAULT;
    chrome.storage.sync.get(null, function(data) {
      if (data.readingSpeed > 0) {
        this.readingSpeed = data.readingSpeed;
      }
      this.colorManual = data.colorManual;
    }.bind(this));
    chrome.storage.onChanged.addListener(this.onOptionsChange.bind(this));
    //chrome.storage.sync.set({'readingSpeed': 250});

    // Update when the page ends loading
    chrome.runtime.onMessage.addListener(this.onContentUpdate.bind(this));
    // Update when switching tabs
    chrome.tabs.onActivated.addListener(this.executeContentScript.bind(this));
    // Update when switching windows
    chrome.windows.onFocusChanged.addListener(this.executeContentScript.bind(this));

    // Run on icon click
    chrome.action.onClicked.addListener((function(tab) { this.executeContentScript(); }).bind(this) );
  }

  executeContentScript() {
    this.setExtensionIcon("·");
    chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(function([tab]) {
      if (tab && tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [ "js/content.js" ]
        })  
      }
    });
  }

  onContentUpdate(request, sender, sendResponse) {
    var label = Math.ceil(request.contentLength / this.readingSpeed);
    if (label > 60) {
      label = "+";
    } else {
      label = label + "′";
    }

    this.setExtensionIcon(label);
  }

  onOptionsChange(changes, areaName) {
    if (changes.readingSpeed) {
      if (changes.readingSpeed.newValue > 0) {
        this.readingSpeed = changes.readingSpeed.newValue;
      } else {
        this.readingSpeed = AVERAGE_READING_SPEED;
      }
    }

    if (changes.colorManual) {
      if (this.colorManual == "") {
        this.colorManual = "606368";
      } else {
        this.colorManual = changes.colorManual.newValue;
      }
    }
  }

  setExtensionIcon(label) {
    this.canvas = new OffscreenCanvas(32, 32);
    this.context = this.canvas.getContext('2d');

    this.context.font = "23px Helvetica";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    if (this.colorManual == COLOR_DEFAULT) {
      this.context.fillStyle = "#606368";
      //this.context.fillStyle = (window.matchMedia('(prefers-color-scheme: dark)').matches ? "#f2f3f4" : "#606368");
    } else {
      this.context.fillStyle = "#" + this.colorManual;
    }
    this.context.fillText(label, 17, 17);

    chrome.action.setIcon({
      imageData: this.context.getImageData(0, 0, 32, 32)
    });
  }
}

let blipread = new Blipread();
