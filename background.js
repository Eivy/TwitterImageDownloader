chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.executeScript(tab.id, {file: 'inject.js'})
	chrome.tabs.insertCSS(tab.id, {file: 'base.css'})
})

function download_item (request, sender, sendResponse) {
	for (let i of request) {
		console.log(i)
		let s = i.split('/')
		try {
			chrome.downloads.download({url: i + ':orig', filename: s[s.length - 1]})
		} catch (e) {
			console.log(e)
		}
	}
}

chrome.runtime.onMessage.addListener(download_item)
