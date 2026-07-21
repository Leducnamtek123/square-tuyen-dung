import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, serverTimestamp, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const DEFAULT_API_KEY = 'AIzaSyDummyDevApiKeyForTesting_MockMode123';
const DEFAULT_PROJECT_ID = 'square-tuyen-dung-dev';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || DEFAULT_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || `${DEFAULT_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || `${DEFAULT_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || '123456789012',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || '1:123456789012:web:abcdef1234567890',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  const enableLongPolling = process.env.NEXT_PUBLIC_FIREBASE_FORCE_LONG_POLLING === 'true';
  db = enableLongPolling
    ? initializeFirestore(app, { experimentalForceLongPolling: true })
    : getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('⚠️ [Firebase Config] Failed to initialize Firebase, applying fallback:', error);
  app = (getApps().length > 0 ? getApps()[0] : {}) as FirebaseApp;
  db = {} as Firestore;
  auth = {} as Auth;
  storage = {} as FirebaseStorage;
}

export { serverTimestamp, auth, storage, app };
export default db;
