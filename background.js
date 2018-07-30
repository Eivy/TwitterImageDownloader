chrome.browserAction.onClicked.addListener((tab) => {
	chrome.tabs.executeScript(tab.id, {file: 'inject.js'})
	chrome.tabs.insertCSS(tab.id, {file: 'base.css'})
})

var authorization = ''
var csrf_token = ''

function download_item (request) {
	chrome.storage.local.get('path', function (result) {
		for (let i of request) {
			let s = i.split('/')
			let name = (result.path || '') + s[s.length - 1].replace(/:.*$/, '')
			if (i.match('blob:')) {
				name += '.ts'
			}
			try {
				chrome.downloads.download({url: i, filename: name})
			} catch (e) {
				console.log(e)
			}
		}
	})
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.hasOwnProperty('id')) {
		sendResponse({ authorization, csrf_token })
		return false
	}
	console.log(request)
	download_item(request)
	return false
})

function getAuth (e) {
	e.requestHeaders.forEach((h) => {
		switch (h.name.toLowerCase()) {
			case 'authorization':
				authorization = h.value
				break
			case 'x-csrf-token':
				csrf_token = h.value
				break
		}
	})
}

chrome.webRequest.onBeforeSendHeaders.addListener(
	getAuth,
	{urls: ['https://*.twitter.com/*']},
	['requestHeaders']
)
