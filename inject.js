function appendItems (target) {
	document.querySelectorAll('.stream img[src*="pbs.twimg.com/media"]').forEach(e => {
		if (document.querySelector('.downloader_image_box img[src="' + e.src + '"]')) {
			return
		}
		let copy = e.cloneNode()
		let box = document.createElement('div')
		box.className = 'downloader_image_box'
		let v = document.createElement('span')
		v.className = 'view'
		v.innerText = '👁'
		v.onclick = event => {
			event.stopPropagation()
			shown.classList.add('shown')
			img.src = copy.src
		}
		box.appendChild(v)
		box.appendChild(copy)
		box.onclick = event => {
			event.stopPropagation()
			if (box.classList.contains('selected')) {
				box.classList.remove('selected')
			} else {
				box.classList.add('selected')
			}
		}
		target.appendChild(box)
	})
}
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
ok.onclick = event => {
	event.stopPropagation()
	let urls = []
	document.querySelectorAll('#imagedownloader .downloader_image_box.selected img').forEach(e => {
		urls.push(e.src)
	})
	chrome.runtime.sendMessage(urls)
	container.remove()
}

let cancel = document.createElement('button')
cancel.className = 'cancel'
cancel.innerText = 'Cancel'
cancel.onclick = event => {
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
let more = document.createElement('div')
more.className = 'get_more'
more.innerText = '⏬'
more.onclick = event => {
	event.stopPropagation()
	scrollTo(0, 99999)
}
container.appendChild(more)
appendItems(images)
const observer = new MutationObserver((mutations) => {
	appendItems(images)
})
observer.observe(document.querySelector('.stream-container'), {attributes: true})
document.body.appendChild(container)
