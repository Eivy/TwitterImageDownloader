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
document.querySelectorAll('.stream img[src*="pbs.twimg.com/media"]').forEach(e => {
	let copy = e.cloneNode()
	let box = document.createElement('div')
	box.className = 'downloader_image_box'
	let ch = document.createElement('input')
	ch.type = 'checkbox'
	ch.onclick = (event) => { event.stopPropagation() }
	box.appendChild(ch)
	box.appendChild(copy)
	box.onclick = (event) => {
		event.stopPropagation()
		chrome.runtime.sendMessage([copy.src])
	}
	images.appendChild(box)
})
container.appendChild(images)
document.body.appendChild(container)
