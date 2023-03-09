// Core assets
let coreAssets = [
	'index.html',
	'treasure.html',
	'dice.html',
	'style.css',
	'index.js',
	'treasure.js',
	'dice.js',
	'offline.html',
];

// Listen for the install event
self.addEventListener('install', function (event) {

	self.skipWaiting();

	event.waitUntil(caches.open('app').then(function (cache) {
	for (let asset of coreAssets) {
		cache.add(new Request(asset));
	}
	return cache;
}));


});

// Listen for request events
self.addEventListener('fetch', function (event) {

	// Get the request
	let request = event.request;

	// Bug fix
	// https://stackoverflow.com/a/49719964
	if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;

	// HTML files
	// Network-first
	if (request.headers.get('Accept').includes('text/html')) {
		event.respondWith(
			fetch(request).then(function (response) {
				return response;
			}).catch(function (error) {
				return caches.match(request).then(function (response) {
					return response || caches.match('offline.html');
				});
			})
		);
		return;
	}


	// Images & Fonts
	// Offline-first
	if (request.headers.get('Accept').includes('image') || request.url.includes('.woff') || request.url.includes('.css') || request.url.includes('.js')) {
		event.respondWith(
			caches.match(request).then(function (response) {
				return response || fetch(request).then(function (response) {

					// If an image, stash a copy of this image in the images cache
					if (request.headers.get('Accept').includes('image')) {
						var copy = response.clone();
						event.waitUntil(caches.open('app').then(function (cache) {
							return cache.put(request, copy);
						}));
					}

					// Return the requested file
					return response;

				});
			})
		);
	}

});