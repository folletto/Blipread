var contentLength = document.body.innerText.split(' ').length;
chrome.runtime.sendMessage({contentLength: contentLength});
