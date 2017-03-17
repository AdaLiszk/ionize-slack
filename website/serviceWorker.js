
const VERSION = '1';

self.addEventListener('install', event => {
	event.waitUntil(self.skipWaiting())
});

self.addEventListener('activate', event => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => fetch(event.request));