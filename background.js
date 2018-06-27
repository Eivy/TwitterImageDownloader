chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.executeScript(tab.id, {file: 'inject.js'})
	chrome.tabs.insertCSS(tab.id, {file: 'base.css'})
})
