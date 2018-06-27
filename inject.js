var d = document.querySelector('#imagedownloader')
if (d) {
	d.remove()
}
let container = document.createElement('div')
container.id = 'imagedownloader'
container.onclick = () => {
	container.remove()
}

let ok = document.createElement('button')
ok.className = 'ok'
ok.innerText = 'Download'
ok.onclick = () => {
	event.stopPropagation()
	let urls = []
	document.querySelectorAll('#imagedownloader input[type="checkbox"]').forEach(e => {
		if (e.checked) {
			urls.push(e.nextSibling.src)
		}
	})
	chrome.runtime.sendMessage(urls)
}

let cancel = document.createElement('button')
cancel.className = 'cancel'
cancel.innerText = 'Cancel'
cancel.onclick = () => {
	event.stopPropagation()
	container.remove()
}

container.appendChild(ok)
container.appendChild(cancel)

let images = document.createElement('div')
images.className = 'downloader_images'
container.appendChild(images)
let shown = document.createElement('div')
shown.className = 'image_viewer'
shown.onclick = event => {
	event.stopPropagation()
	shown.classList.remove('shown')
}
let img = document.createElement('img')
shown.appendChild(img)
container.appendChild(shown)
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
		shown.classList.add('shown')
		img.src = copy.src
	}
	images.appendChild(box)
})
document.body.appendChild(container)
