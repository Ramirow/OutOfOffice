import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCalI3mNU_-pZrVfYLUxj3MRN_MH2ppJnQ",
  authDomain: "outofofficeclone.firebaseapp.com",
  projectId: "outofofficeclone",
  storageBucket: "outofofficeclone.firebasestorage.app",
  messagingSenderId: "663986336921",
  appId: "1:663986336921:web:a965369cb7dd664d447408"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Auth might already be initialized
  const { getAuth } = require("firebase/auth");
  auth = getAuth(app);
}

export { auth };
export default app;