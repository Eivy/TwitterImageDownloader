let scrolling = false
function scrollToBottom () {
	if (scrolling) {
		return
	}
	scrolling = true
	var max = document.body.scrollHeight - window.parent.screen.height
	var scrollPosition = document.documentElement.scrollTop
	let interval = setInterval(() => {
		if (scrollPosition >= max) {
			clearInterval(interval)
			scrolling = false
		}
		scrollPosition += window.parent.screen.height / 2
		scrollTo(0, scrollPosition)
	}, 80)
}

function getUrl (url) {
	if (url.includes('?')) {
		let tmp = url.split('?')
		let obj = {}
		tmp[1].split('&').forEach((s) => {
			let v = s.split('=')
			obj[v[0]] = v[1]
		})
		if (obj['format']) {
			url = tmp[0] + '.' + obj['format']
		}
	}
	return url
}

function doJob () {
	var d = document.querySelector('#imagedownloader')
	if (d) {
		d.remove()
	}
	var auth = {}
	chrome.runtime.sendMessage({id: ''}, (value) => {
		auth = value
	})
	let container = document.createElement('div')
	container.id = 'imagedownloader'
	container.setAttribute('path', window.location.toString())
	container.onclick = () => {
		close()
	}

	container.onscroll = () => {
		if (container.scrollTop + container.clientHeight > container.scrollHeight - container.clientHeight / 2) {
			scrollToBottom()
		}
	}

	let ok = document.createElement('button')
	ok.className = 'ok'
	ok.innerText = 'Download'
	ok.onclick = async event => {
		event.stopPropagation()
		try {
			let urls = []
			document.querySelectorAll('#imagedownloader .downloader_image_box.selected.image img').forEach(e => {
				let url = getUrl(e.src) + ':orig'
				urls.push({url, filename: e.filename})
			})
			let videos = document.querySelectorAll('#imagedownloader .downloader_image_box.selected.video img')
			for (let video of videos) {
				if (video.hasOwnProperty('video_url')) {
					urls.push({url: video.video_url, filename: video.filename})
				} else {
					let url = await getVideo(video.id)
					urls.push({url, filename: video.filename})
				}
			}
			chrome.runtime.sendMessage(urls)
		} catch (ex) {
			console.log(ex)
		}
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

	let select = document.createElement('button')
	select.className = 'select'
	select.innerText = 'Select All'
	select.onclick = event => {
		event.stopPropagation()
		document.querySelectorAll('#imagedownloader .downloader_image_box').forEach(e => {
			e.classList.add('selected')
		})
	}

	container.appendChild(ok)
	container.appendChild(cancel)
	container.appendChild(select)

	let listSlider = document.createElement('input')
	listSlider.id = 'size'
	listSlider.type = 'range'
	listSlider.min = 2
	listSlider.max = 100
	listSlider.value = 12
	listSlider.addEventListener('click', event => { event.stopPropagation() })
	listSlider.addEventListener('input', () => {
		document.querySelectorAll('.downloader_image_box').forEach((e) => {
			e.style.width = listSlider.value + 'vw'
			e.style.height = listSlider.value + 'vw'
		})
	})
	container.appendChild(listSlider)

	let images = document.createElement('div')
	images.className = 'downloader_images'
	container.appendChild(images)
	let more = document.createElement('div')
	more.className = 'get_more'
	more.innerText = '⏬'
	more.onclick = event => {
		event.stopPropagation()
		scrollToBottom()
	}
	container.appendChild(more)
	appendItems(images)
	const observer = new MutationObserver((mutations) => {
		appendItems(images)
	})
	try {
		let trg = document.querySelector('.stream-container')
		if (trg) {
			observer.observe(trg, {attributes: true})
		} else {
			observer.observe(document.querySelector('main section'), {subtree: true, attributes: true})
		}
	} catch (ex) {
		console.log(ex)
	}
	document.body.appendChild(container)

	function appendItems (target) {
		document.querySelectorAll('article').forEach(async a => {
			let imgs = a.querySelectorAll('img[src*="pbs.twimg.com/media"]')
			let item
			for (let i = 0; i < imgs.length; i = i + 2) {
				item = getImageItem(imgs[i])
				if (item) {
					target.appendChild(item)
				}
			}
			for (let i = 1; i < imgs.length; i = i + 2) {
				item = getImageItem(imgs[i])
				if (item) {
					target.appendChild(item)
				}
			}
		})
		document.querySelectorAll('article video, .AdaptiveMedia img[src*="pbs.twimg.com/media"], .AdaptiveStreamGridImage img[src*="pbs.twimg.com/media"], .MomentMediaItem img[src*="pbs.twimg.com/media"], .AdaptiveMedia div.PlayableMedia-player').forEach(async e => {
			var item
			if (e.tagName.toLowerCase() === 'div') {
				item = getVideoItemFromDiv(e)
			} else if (e.tagName.toLowerCase() === 'video') {
				item = getVideoItemFromVideo(e)
			} else if (e.tagName.toLowerCase() === 'img') {
				item = getImageItem(e)
			}
			if (item) {
				target.appendChild(item)
			}
		})
	}

	function showContextMenu (e) {
		e.preventDefault()
		closeContextMenu()
		let menu = document.createElement('ul')
		menu.className = 'menu'
		menu.addEventListener('click', (ev) => {
			ev.stopPropagation()
			closeContextMenu()
		})
		let scroll = document.createElement('li')
		scroll.innerHTML = 'Scroll to in timeline'
		scroll.addEventListener('click', () => {
			close()
			let item = document.querySelector('img[src="' + e.target.src + '"],div.PlayableMedia-player[style*="' + e.target.src + '"]')
			item.scrollIntoView()
		})
		let view = document.createElement('li')
		view.innerHTML = 'Show Fullscreen'
		view.addEventListener('click', () => {
			e.target.previousElementSibling.click()
		})
		let newtab = document.createElement('li')
		newtab.innerHTML = 'Open image in new tab'
		newtab.addEventListener('click', () => {
			window.open(e.target.src)
		})
		menu.appendChild(scroll)
		menu.appendChild(view)
		menu.appendChild(newtab)
		menu.style.top = e.y + container.scrollTop + 'px'
		menu.style.left = e.x + 'px'
		container.appendChild(menu)
	}

	function closeContextMenu () {
		let menu = document.querySelector('#imagedownloader .menu')
		if (menu) {
			menu.remove()
		}
	}

	function getImageItem (e) {
		if (document.querySelector('.downloader_image_box img[src="' + e.src + '"]')) {
			return null
		}
		let item = document.createElement('img')
		item.src = e.src
		item.oncontextmenu = showContextMenu
		var idx = 0
		if (document.querySelector('main')) {
			let p = e.parentElement
			while (p.tagName.toLowerCase() !== 'article') {
				p = p.parentElement
			}
			let tmp = p.querySelector('a[href*="/status/"]').href.split('/')
			let tweetid = tmp[tmp.length - 1]
			let userid = tmp[tmp.length - 3]
			let url = getUrl(e.src)
			tmp = url.split('.')
			var imgs = p.querySelectorAll('img[src*="pbs.twimg.com/media"')
			for (;idx < imgs.length; idx++) {
				if (imgs[idx].src === e.src) {
					break
				}
			}
			item.filename = [userid, tweetid, idx].join('_') + '.' + tmp[tmp.length - 1]
		} else {
			let src = e
			while (!src.hasAttribute('data-item-id')) {
				src = src.parentElement
			}
			let imgs = null
			if (src.classList.contains('AdaptiveStreamGridImage')) {
				imgs = document.querySelectorAll('span[data-item-id="' + src.getAttribute('data-item-id') + '"] img')
			} else {
				imgs = document.querySelectorAll('div[data-item-id="' + src.getAttribute('data-item-id') + '"] .AdaptiveMedia img')
			}
			for (;idx < imgs.length; idx++) {
				if (imgs[idx].src === e.src) {
					break
				}
			}
			let tmp = e.src.split('.')
			item.filename = [src.getAttribute('data-screen-name'), src.getAttribute('data-item-id'), idx].join('_') + '.' + tmp[tmp.length - 1]
		}
		let box = document.createElement('div')
		box.className = 'downloader_image_box'
		let value = listSlider.value
		box.style.width = value + 'vw'
		box.style.height = value + 'vw'
		box.classList.add('image')
		let v = document.createElement('span')
		v.className = 'view'
		v.innerText = '👁'
		v.onclick = event => {
			event.stopPropagation()
			let image = document.createElement('img')
			image.src = e.src
			showItem(image)
		}
		box.appendChild(v)
		box.appendChild(item)
		box.onclick = event => {
			event.stopPropagation()
			closeContextMenu()
			if (box.classList.contains('selected')) {
				box.classList.remove('selected')
			} else {
				box.classList.add('selected')
			}
			badge.innerText = document.querySelectorAll('#imagedownloader .downloader_image_box.selected img').length
			badge.style.visibility = badge.innerText !== '0' ? 'visible' : 'hidden'
		}
		return box
	}

	function getVideoItemFromDiv (e) {
		if (document.querySelector('.downloader_image_box img[src="' + e.style.backgroundImage.slice(5, -2) + '"]')) {
			return null
		}
		let item = document.createElement('img')
		item.src = e.style.backgroundImage.slice(5, -2)
		item.oncontextmenu = showContextMenu
		while (e.parentNode.tagName.toLowerCase() !== 'li') {
			e = e.parentNode
		}
		let id = e.getAttribute('data-tweet-id')
		item.setAttribute('id', id)
		let src = document.querySelector('div[data-item-id="' + id + '"]')
		item.filename = [src.getAttribute('data-screen-name'), src.getAttribute('data-item-id')].join('_') + '.mp4'
		let v = document.createElement('span')
		v.className = 'view'
		v.innerText = '📹'
		v.onclick = async (event) => {
			event.stopPropagation()
			let url = await getVideo(id)
			if (url !== '') {
				let video = document.createElement('video')
				video.src = url
				video.poster = item.src
				video.setAttribute('controls', '')
				video.setAttribute('autoplay', '')
				video.setAttribute('loop', '')
				showItem(video)
			}
		}
		let box = document.createElement('div')
		box.className = 'downloader_image_box'
		let value = listSlider.value
		box.style.width = value + 'vw'
		box.style.height = value + 'vw'
		box.classList.add('video')
		box.appendChild(v)
		box.appendChild(item)
		box.onclick = event => {
			event.stopPropagation()
			closeContextMenu()
			if (box.classList.contains('selected')) {
				box.classList.remove('selected')
			} else {
				box.classList.add('selected')
			}
			badge.innerText = document.querySelectorAll('#imagedownloader .downloader_image_box.selected img').length
			badge.style.visibility = badge.innerText !== '0' ? 'visible' : 'hidden'
		}
		return box
	}

	function getVideoItemFromVideo (e) {
		if (document.querySelector('.downloader_image_box img[src="' + e.poster + '"]')) {
			return null
		}
		let item = document.createElement('img')
		item.src = e.poster
		item.oncontextmenu = showContextMenu
		let p = e.parentNode
		while (p.tagName.toLowerCase() !== 'article') {
			p = p.parentElement
		}
		let tmp = p.querySelector('a[href*="/status/"]').href.split('/')
		let tweetid = tmp[tmp.length - 1]
		let userid = tmp[tmp.length - 3]
		let id = tmp[tmp.length - 1]
		item.setAttribute('id', id)
		item.filename = [userid, tweetid].join('_') + '.mp4'
		let v = document.createElement('span')
		v.className = 'view'
		v.innerText = '📹'
		v.onclick = async (event) => {
			event.stopPropagation()
			let url = await getVideo(id)
			if (url !== '') {
				let video = document.createElement('video')
				video.src = url
				video.poster = item.src
				video.setAttribute('controls', '')
				video.setAttribute('autoplay', '')
				video.setAttribute('loop', '')
				showItem(video)
			}
		}
		let box = document.createElement('div')
		box.className = 'downloader_image_box'
		let value = listSlider.value
		box.style.width = value + 'vw'
		box.style.height = value + 'vw'
		box.classList.add('video')
		box.appendChild(v)
		box.appendChild(item)
		box.onclick = event => {
			event.stopPropagation()
			closeContextMenu()
			if (box.classList.contains('selected')) {
				box.classList.remove('selected')
			} else {
				box.classList.add('selected')
			}
			badge.innerText = document.querySelectorAll('#imagedownloader .downloader_image_box.selected img').length
			badge.style.visibility = badge.innerText !== '0' ? 'visible' : 'hidden'
		}
		return box
	}

	async function showItem (item) {
		let shown = document.createElement('div')
		shown.className = 'image_viewer'
		shown.onclick = event => {
			event.stopPropagation()
			document.removeEventListener('keydown', keydownOnImageViewer)
			shown.remove()
		}
		let close = document.createElement('span')
		close.innerHTML = '❌'
		close.className = 'closer'
		close.onclick = event => {
			event.stopPropagation()
			document.removeEventListener('keydown', keydownOnImageViewer)
			shown.remove()
		}
		shown.appendChild(close)
		let preBtn = document.createElement('div')
		preBtn.className = 'button'
		preBtn.innerText = '⬅'
		preBtn.onclick = event => {
			event.stopPropagation()
			let shownMedia = document.querySelector('.image_viewer img, .image_viewer video')
			let next = document.querySelector('.downloader_image_box img[src="' +
				(shownMedia.tagName.toLowerCase() === 'video' ? shownMedia.poster : shownMedia.src) +
				'"]').parentElement.previousElementSibling.firstChild
			shownMedia.parentElement.remove()
			next.click()
		}
		shown.appendChild(preBtn)
		shown.appendChild(item)
		let nextBtn = document.createElement('div')
		nextBtn.className = 'button'
		nextBtn.innerText = '➡'
		nextBtn.onclick = event => {
			event.stopPropagation()
			let shownMedia = document.querySelector('.image_viewer img, .image_viewer video')
			let next = document.querySelector('.downloader_image_box img[src="' +
				(shownMedia.tagName.toLowerCase() === 'video' ? shownMedia.poster : shownMedia.src) +
				'"]').parentElement.nextElementSibling.firstChild
			shownMedia.parentElement.remove()
			next.click()
		}
		shown.appendChild(nextBtn)
		container.appendChild(shown)
		document.addEventListener('keydown', keydownOnImageViewer)
		let slider = document.createElement('input')
		slider.type = 'range'
		slider.min = 10
		slider.max = 500
		slider.value = 100
		slider.addEventListener('input', () => {
			let view = shown.querySelector('img')
			view.style.width = slider.value + '%'
		})
		slider.addEventListener('mousedown', event => {
			event.stopPropagation()
			shown.style.overflow = 'auto'
			shown.style.textAlign = 'center'
			let view = shown.querySelector('img')
			view.style.top = 'unset'
			view.style.left = 'unset'
			view.style.maxHeight = 'unset'
			view.style.maxWidth = 'unset'
			view.style.position = 'relative'
			view.style.transform = 'unset'
		})
		slider.addEventListener('click', event => { event.stopPropagation() })
		let input = document.createElement('span')
		let sbefore = document.createElement('span')
		sbefore.innerHTML = '0.1x'
		let safter = document.createElement('span')
		safter.innerHTML = '10x'
		input.appendChild(sbefore)
		input.appendChild(slider)
		input.appendChild(safter)
		input.className = 'input'
		shown.appendChild(input)
	}

	function keydownOnImageViewer (e) {
		if (e.keyCode === 37) {
			document.querySelectorAll('.image_viewer .button')[0].click()
		} else if (e.keyCode === 39) {
			document.querySelectorAll('.image_viewer .button')[1].click()
		}
	}

	async function getVideo (id) {
		console.log(auth)
		let url = ''
		let xhr = new XMLHttpRequest()
		xhr.open('GET', 'https://api.twitter.com/1.1/statuses/show/' + id + '.json', false)
		xhr.withCredentials = true
		xhr.crossDomain = true
		xhr.setRequestHeader('authorization', auth.authorization)
		xhr.setRequestHeader('x-csrf-token', auth.csrf_token)
		xhr.send()
		let data = JSON.parse(xhr.responseText)
		if (data.hasOwnProperty('extended_entities')) {
			for (let m of data.extended_entities.media) {
				let bitrate = 0
				for (let v of m.video_info.variants) {
					if (v.content_type === 'video/mp4' && v.bitrate > bitrate) {
						bitrate = v.bitrate
						url = v.url.split('?')[0]
					}
				}
			}
		} else {
			xhr.open('GET', 'https://api.twitter.com/1.1/videos/tweet/config/' + id + '.json', false)
			xhr.withCredentials = true
			xhr.crossDomain = true
			xhr.setRequestHeader('authorization', auth.authorization)
			xhr.setRequestHeader('x-csrf-token', auth.csrf_token)
			xhr.send()
			data = JSON.parse(xhr.responseText)
			if (data.track.playbackType === 'video/mp4') {
				url = data.track.playbackUrl
			} else if (data.track.playbackType === 'application/x-mpegURL') {
				let urls = parseM3U8(data.track.playbackUrl)
				let array = []
				for (let i in urls) {
					let response = await fetch(urls[i])
					array.push(await response.arrayBuffer())
				}
				let length = 0
				array.forEach(a => {
					length += a.byteLength
				})
				let buffer = new Uint8Array(length)
				let pos = 0
				array.forEach(a => {
					buffer.set(new Uint8Array(a), pos)
					pos += a.byteLength
				})
				let blob = new Blob([buffer], {type: 'video/mp2t'})
				url = window.URL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob)
			}
		}
		return url
	}

	function parseM3U8 (url) {
		var urls = getUrlsFromM3U8(url)
		return urls
	}

	function getUrlsFromM3U8 (url) {
		let list = []
		let xhr = new XMLHttpRequest()
		if (!url.match(/^https?:\/\//)) {
			url = 'https://video.twimg.com' + url
		}
		xhr.open('GET', url, false)
		xhr.send()
		var lines = xhr.responseText.split(/\r?\n/)
		lines.forEach(l => {
			if (l.match(/^[^#].+\.ts$/)) {
				if (l.match(/^\//)) {
					l = 'https://video.twimg.com' + l
				}
				list.push(l)
			} else if (l.match(/\.m3u8$/)) {
				list = list.concat(getUrlsFromM3U8(l))
			}
		})
		return list
	}

	function close () {
		// observer.disconnect()
		container.style.display = 'none'
	}
}

var d = document.querySelector('#imagedownloader')
if (d && d.getAttribute('path') === window.location.toString()) {
	d.style.display = 'block'
} else {
	doJob()
}
