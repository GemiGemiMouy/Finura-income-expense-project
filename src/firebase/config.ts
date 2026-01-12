// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBL4QwKSEYrrmulgVeBQyYdRFgYb-OHh8Q",
  authDomain: "income-expenses-52bf1.firebaseapp.com",
  projectId: "income-expenses-52bf1",
  storageBucket: "income-expenses-52bf1.firebasestorage.app",
  messagingSenderId: "124563587256",
  appId: "1:124563587256:web:00f7f6dcbe6836fe93f44d",
  measurementId: "G-L8LG208TKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}