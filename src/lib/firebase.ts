
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr94x5n7yGQUA8alVZwNrYzEoO2uXfMyM",
  authDomain: "fame-factory-1sck6.firebaseapp.com",
  projectId: "fame-factory-1sck6",
  storageBucket: "fame-factory-1sck6.firebasestorage.app",
  messagingSenderId: "795632417803",
  appId: "1:795632417803:web:73ef0b813236a8f939db0e"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
