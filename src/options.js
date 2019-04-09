let dir = document.querySelector('#dir')
chrome.storage.local.get('path', (result) => {
	dir.value = result.path || ''
})
let id = document.querySelector('#id')
chrome.storage.local.get('use_id', (result) => {
	id.checked = result.use_id || false
})
function saveOptions () {
	let path = dir.value.replace(/\/+$/, '') + '/'
	if (path === '/') {
		path = ''
	}
	chrome.storage.local.set({path, use_id: id.checked})
}
document.querySelector('form').addEventListener('submit', saveOptions)
