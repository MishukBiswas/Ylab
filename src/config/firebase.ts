import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC-xg0Nbg0cXS0pitaJhvjfYCuSvuPkS-A",
  authDomain: "yuelab-70908.firebaseapp.com",
  projectId: "yuelab-70908",
  storageBucket: "yuelab-70908.appspot.com",
  messagingSenderId: "474324733912",
  appId: "1:474324733912:web:6f248ac7c2f9bc97f1ecad",
  measurementId: "G-WCYFL85HJY"
};

// Initialize Firebase
let app;
try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    app = getApp();
    console.log('Firebase already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase');
}

// Initialize services with error handling
export const db = (() => {
  try {
    return getFirestore(app);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw new Error('Failed to initialize Firestore');
  }
})();

export const storage = (() => {
  try {
    return getStorage(app);
  } catch (error) {
    console.error('Error initializing Storage:', error);
    throw new Error('Failed to initialize Storage');
  }
})();

export const auth = (() => {
  try {
    return getAuth(app);
  } catch (error) {
    console.error('Error initializing Auth:', error);
    throw new Error('Failed to initialize Auth');
  }
})();

// Initialize analytics only if supported
export const analytics = (async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    console.log('Analytics not supported in this environment');
    return null;
  } catch (error) {
    console.error('Error initializing Analytics:', error);
    return null;
  }
})();

export default app; 