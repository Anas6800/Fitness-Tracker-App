import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

// Firebase Web App config (hardcoded as requested)
// Note: These values are not "secret" by themselves, but hardcoding can make it easy
// to accidentally commit project config to a public repo.
const firebaseConfig = {
  apiKey: 
  authDomain: "fitness-challenge-tracke-9bafa.firebaseapp.com",
  projectId: "fitness-challenge-tracke-9bafa",
  storageBucket: "fitness-challenge-tracke-9bafa.firebasestorage.app",
  messagingSenderId: "497755064584",
  appId: "1:497755064584:web:d7c7cc1dc9373cea4704bd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Speed up reloads by serving cached data immediately (then syncing).
// Safe to ignore failures (e.g. multiple tabs open).
enableIndexedDbPersistence(db).catch(() => {
  // no-op
});
