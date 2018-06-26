var d = document.querySelector('#imagedownloader')
if (d) {
	d.remove()
}
let container = document.createElement('div')
container.id = 'imagedownloader'
let images = document.createElement('div')
images.className = 'downloader_images'
document.querySelectorAll('.AdaptiveMedia-photoContainer').forEach(e => {
	let box = document.createElement('div')
	let copy = e.cloneNode(true)
	box.appendChild(copy)
	box.className = 'downloader_image_box'
	images.appendChild(box)
})
container.appendChild(images)
document.body.appendChild(container)
