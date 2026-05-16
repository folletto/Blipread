chrome.runtime.sendMessage({ pageState: {
	pageWordsLength: document.body.innerText.split(' ').length,
	selectionWordsLength: (s => s ? s.split(' ').length : 0)(window.getSelection().toString().trim())
} });
