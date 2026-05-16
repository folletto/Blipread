/*
 * Blipread: internal process
 */

// System
const AVERAGE_READING_SPEED = 200;
const COLOR_DEFAULT = "";

// Text
const TEXT_REFRESH_DEFAULT = "No content found";
const TEXT_PAGE_NOT_ACCESSIBLE = "This page is not accessible";
const TEXT_TAB_NOT_FOUND = "No tab found";
const TEXT_TOOLTIP = " min read · click to refresh";


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

    // Update when messages are sent
    chrome.runtime.onMessage.addListener(this.onMessageUpdate.bind(this));
    
    // Update when switching tabs
    chrome.tabs.onActivated.addListener(this.executeContentScript.bind(this));
    // Update when switching windows
    chrome.windows.onFocusChanged.addListener(this.executeContentScript.bind(this));

  }

  executeContentScript() {
    // Default
    this.setExtensionIcon("·");
    chrome.action.setTitle({ title: TEXT_REFRESH_DEFAULT });

    chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
      if (tab && tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [ "js/content.js" ]
        }).catch(() => {
          this.sendMessage({ pageError: TEXT_PAGE_NOT_ACCESSIBLE });
        });
      }
    }).catch(() => {
      this.sendMessage({ pageError: TEXT_TAB_NOT_FOUND });
    });
  }

  sendMessage(request) {
    // chrome.runtime.sendMessage doesn't send to self.
    // This function emulates the self-sending, so the service worker doesn't need a special logic
    this.onMessageUpdate(request);
    chrome.runtime.sendMessage(request).catch(() => {});
  }

  onMessageUpdate(request, sender, sendResponse) {
    if (request.requestRefresh) {
      this.executeContentScript();
    }

    if (request.pageState) {
      this.sendMessage({ pageEval: {
        pageTime: Math.ceil(request.pageState.pageWordsLength / this.readingSpeed),
        selectionTime: Math.ceil(request.pageState.selectionWordsLength / this.readingSpeed)
      } });
    }

    if (request.pageEval) {
      chrome.action.setTitle({ title: request.pageEval.pageTime + TEXT_TOOLTIP });

      var labelIcon = "";
      if (request.pageEval.pageTime > 60) {
        labelIcon = "+";
      } else {
        labelIcon = request.pageEval.pageTime + "′";
      }

      this.setExtensionIcon(labelIcon);
    }
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
