chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.executeScript(tab.id, {file: 'inject.js'})
	chrome.tabs.insertCSS(tab.id, {file: 'base.css'})
})

async function download_item (request, sender, sendResponse) {
	chrome.storage.local.get('path', function (result) {
		for (let i of request) {
			console.log(i)
			let s = i.split('/')
			try {
				chrome.downloads.download({url: i, filename: (result.path || '') + s[s.length - 1]})
			} catch (e) {
				console.log(e)
			}
		}
	})
}

chrome.runtime.onMessage.addListener(download_item)
