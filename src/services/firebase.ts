import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBKMDwYeSjmgQLnpYciReSK2yJU0pG6KS8",
    authDomain: "nicotinepouches-d9d1c.firebaseapp.com",
    projectId: "nicotinepouches-d9d1c",
    storageBucket: "nicotinepouches-d9d1c.firebasestorage.app",
    messagingSenderId: "42131125480",
    appId: "1:42131125480:web:8022461f0a790a5677855d"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with async storage for React Native (to keep users logged in)
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { app, auth, db };
