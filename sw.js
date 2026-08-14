// Minimal service worker — enables "Add to Home Screen" installability.
// No caching of the submission endpoint or trailer list, since both need
// to be live/current for this to work correctly.

self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { self.clients.claim(); });
self.addEventListener('fetch', (event) => { /* pass-through, no caching */ });
