var contentLength = document.body.innerText.split(' ').length;
var schemeColor = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

chrome.runtime.sendMessage({
	contentLength: contentLength,
	schemeColor: schemeColor,
});
