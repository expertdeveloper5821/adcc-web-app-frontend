import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from 'firebase/messaging';
import app from '../config/firebase';

const FCM_TOKEN_STORAGE_KEY = 'fcmToken';
const FCM_TOKEN_SYNCED_KEY = 'fcmTokenSynced';
const FCM_DEVICE_ID_KEY = 'fcmDeviceId';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export const getStoredFcmToken = (): string | null => {
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
};

export const getLastSyncedFcmToken = (): string | null => {
  return localStorage.getItem(FCM_TOKEN_SYNCED_KEY);
};

export const markFcmTokenSynced = (token: string): void => {
  localStorage.setItem(FCM_TOKEN_SYNCED_KEY, token);
};

export const clearStoredFcmToken = (): void => {
  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  localStorage.removeItem(FCM_TOKEN_SYNCED_KEY);
};

export const getOrCreateFcmDeviceId = (): string => {
  const existing = localStorage.getItem(FCM_DEVICE_ID_KEY);
  if (existing) return existing;

  const newId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(FCM_DEVICE_ID_KEY, newId);
  return newId;
};

export const getFcmClientInfo = (): { userAgent?: string; deviceId: string; platform: 'web' } => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
  return {
    userAgent,
    deviceId: getOrCreateFcmDeviceId(),
    platform: 'web',
  };
};

const getFirebaseConfigForSw = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
});

const registerFcmServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;

  // Initialize Firebase in the service worker via postMessage
  const config = getFirebaseConfigForSw();
  if (registration.active) {
    registration.active.postMessage({ type: 'INIT_FIREBASE_MESSAGING', config });
  } else if (registration.waiting) {
    registration.waiting.postMessage({ type: 'INIT_FIREBASE_MESSAGING', config });
  } else if (registration.installing) {
    registration.installing.addEventListener('statechange', () => {
      if (registration.active) {
        registration.active.postMessage({ type: 'INIT_FIREBASE_MESSAGING', config });
      }
    });
  }

  return registration;
};

export const initFcmToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  const supported = await isSupported();
  if (!supported) {
    console.warn('⚠️ Firebase messaging is not supported in this browser.');
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('⚠️ Notifications are not supported in this browser.');
    return null;
  }

  if (!VAPID_KEY) {
    console.warn('⚠️ Missing VITE_FIREBASE_VAPID_KEY. Unable to request FCM token.');
    return null;
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    console.log('ℹ️ Notification permission not granted.');
    return null;
  }

  const registration = await registerFcmServiceWorker();
  if (!registration) {
    console.warn('⚠️ Failed to register service worker for FCM.');
    return null;
  }

  try {
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      return token;
    }

    console.warn('⚠️ No FCM token returned.');
    return null;
  } catch (error) {
    console.error('❌ Failed to get FCM token:', error);
    return null;
  }
};

let foregroundListenerInitialized = false;

export const initForegroundMessageListener = async (): Promise<void> => {
  if (foregroundListenerInitialized) return;
  if (typeof window === 'undefined') return;

  const supported = await isSupported();
  if (!supported) return;

  const messaging = getMessaging(app);
  onMessage(messaging, (payload: MessagePayload) => {
    console.log('🔔 FCM foreground message payload:', payload);
  });

  foregroundListenerInitialized = true;
};
