import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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
    console.log('Firebase Admin initialized successfully');
  } else {
    app = getApp();
    console.log('Firebase Admin already initialized');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  throw new Error('Failed to initialize Firebase Admin');
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

export default app; 