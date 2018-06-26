chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.executeScript(tab.id, {file: 'background.js'})
	chrome.tabs.insertCss(tab.id, {file: 'base.css'})
})
