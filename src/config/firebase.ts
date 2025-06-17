import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app; 