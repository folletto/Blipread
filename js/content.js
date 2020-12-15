chrome.runtime.sendMessage({
	contentLength: document.body.innerText.split(' ').length
});
