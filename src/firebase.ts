import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

// Firebase Web App config (hardcoded as requested)
// Note: These values are not "secret" by themselves, but hardcoding can make it easy
// to accidentally commit project config to a public repo.
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId:"",
  appId: "",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Speed up reloads by serving cached data immediately (then syncing).
// Safe to ignore failures (e.g. multiple tabs open).
enableIndexedDbPersistence(db).catch(() => {
  // no-op
});
