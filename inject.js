var d = document.querySelector('#imagedownloader')
if (d) {
	d.remove()
}
let container = document.createElement('div')
container.id = 'imagedownloader'
container.onclick = () => {
	container.remove()
}
let images = document.createElement('div')
images.className = 'downloader_images'
document.querySelectorAll('.AdaptiveMedia-photoContainer').forEach(e => {
	let copy = e.cloneNode(true)
	copy.className = 'downloader_image_box'
	copy.style.backgroundColor = ''
	copy.onclick = (event) => {
		event.stopPropagation()
		chrome.runtime.sendMessage([copy.querySelector('img').src])
	}
	images.appendChild(copy)
})
container.appendChild(images)
document.body.appendChild(container)
