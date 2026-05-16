chrome.runtime.sendMessage({ pageState: {
	pageWordsLength: document.body.innerText.split(' ').length,
	selectionWordsLength: window.getSelection().toString().trim().split(' ').length
} });
