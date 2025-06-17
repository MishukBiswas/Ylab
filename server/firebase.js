import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firestore
export const db = getFirestore(app);

export default app; 