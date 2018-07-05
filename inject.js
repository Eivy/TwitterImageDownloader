var d = document.querySelector('#imagedownloader')
if (d) {
	d.remove()
}
let container = document.createElement('div')
container.id = 'imagedownloader'
container.onclick = () => {
	close()
}

container.onscroll = () => {
	if (container.scrollTop + container.clientHeight > container.scrollHeight - container.clientHeight / 2) {
		scrollTo(0, 99999)
	}
}

let ok = document.createElement('button')
ok.className = 'ok'
ok.innerText = 'Download'
ok.onclick = event => {
	event.stopPropagation()
	let urls = []
	document.querySelectorAll('#imagedownloader .downloader_image_box.selected img').forEach(e => {
		urls.push(e.src + ':orig')
	})
	chrome.runtime.sendMessage(urls)
	close()
}
let badge = document.createElement('span')
badge.className = 'badge'
ok.appendChild(badge)

let cancel = document.createElement('button')
cancel.className = 'cancel'
cancel.innerText = 'Cancel'
cancel.onclick = event => {
	event.stopPropagation()
	close()
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

function appendItems (target) {
	document.querySelectorAll('.js-navigable-stream img[src*="pbs.twimg.com/media"]').forEach(e => {
		if (document.querySelector('.downloader_image_box img[src="' + e.src + '"]')) {
			return
		}
		let item = document.createElement('img')
		item.src = e.src
		let box = document.createElement('div')
		box.className = 'downloader_image_box'
		let v = document.createElement('span')
		v.className = 'view'
		v.innerText = '👁'
		v.onclick = event => {
			event.stopPropagation()
			shown.classList.add('shown')
			img.src = e.src
		}
		box.appendChild(v)
		box.appendChild(item)
		box.onclick = event => {
			event.stopPropagation()
			if (box.classList.contains('selected')) {
				box.classList.remove('selected')
			} else {
				box.classList.add('selected')
			}
			badge.innerText = document.querySelectorAll('#imagedownloader .downloader_image_box.selected img').length
			badge.style.visibility = badge.innerText !== '0' ? 'visible' : 'hidden'
		}
		target.appendChild(box)
	})
}

function close () {
	observer.disconnect()
	container.remove()
}
