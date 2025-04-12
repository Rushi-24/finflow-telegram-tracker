
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Timestamp as FirestoreTimestamp } from 'firebase/firestore';

// Re-export Firebase Timestamp for use throughout the app
export type Timestamp = FirestoreTimestamp;

const firebaseConfig = {
  apiKey: "AIzaSyBpLdE3rlJwSpE6P6pVTkVu5TT1YHCVwzM",
  authDomain: "finflow-app.firebaseapp.com",
  projectId: "finflow-app",
  storageBucket: "finflow-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, FirestoreTimestamp };
