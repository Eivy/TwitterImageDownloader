let dir = document.querySelector('#dir')
chrome.storage.local.get('path', (result) => {
	dir.value = result.path || ''
})
function saveOptions () {
	chrome.storage.local.set({path: dir.value.replace(/\/+$/, '') + '/'})
}
document.querySelector('form').addEventListener('submit', saveOptions)
