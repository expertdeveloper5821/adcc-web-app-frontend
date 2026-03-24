/* eslint-disable no-undef */
// Firebase Messaging Service Worker (initialized via postMessage from the app)
// importScripts must run at top-level (not after installation).
importScripts('/firebase-app-compat.js');
importScripts('/firebase-messaging-compat.js');

let messagingInitialized = false;

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type !== 'INIT_FIREBASE_MESSAGING' || messagingInitialized) return;

  const config = data.config;
  if (!config) return;

  if (!self.firebase || !firebase.messaging) {
    console.error('❌ Firebase scripts not available in service worker.');
    return;
  }

  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('🔔 FCM background message payload:', payload);
    const title = (payload.notification && payload.notification.title) || 'Notification';
    const options = {
      body: (payload.notification && payload.notification.body) || '',
      icon: payload.notification && payload.notification.icon,
      data: payload.data,
    };

    self.registration.showNotification(title, options);
  });

  messagingInitialized = true;
});
