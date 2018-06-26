chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.executeScript(tab.id, {file: 'background.js'})
	chrome.tabs.insertCSS(tab.id, {file: 'base.css'})
})
