import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCalI3mNU_-pZrVfYLUxj3MRN_MH2ppJnQ",
  authDomain: "outofofficeclone.firebaseapp.com",
  projectId: "outofofficeclone",
  storageBucket: "outofofficeclone.firebasestorage.app",
  messagingSenderId: "663986336921",
  appId: "1:663986336921:web:a965369cb7dd664d447408"
};

// Initialize Firebase App (only if not already initialized)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth (optional - app currently uses AsyncStorage for auth)
// Initialize lazily to avoid "Component auth has not been registered yet" errors
let auth = null;

// Lazy initialization function - only initialize when actually needed
const getAuthInstance = () => {
  if (auth) return auth;
  
  try {
    // Try to initialize with AsyncStorage persistence (for React Native)
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    return auth;
  } catch (error) {
    // If initialization fails, try getAuth
    try {
      auth = getAuth(app);
      return auth;
    } catch (getAuthError) {
      // If both fail, return null (app uses AsyncStorage for auth anyway)
      console.warn('Firebase Auth not available:', getAuthError.message || getAuthError);
      return null;
    }
  }
};

// Export the getter function instead of direct auth instance
// This prevents initialization errors on import

// Initialize Firestore (Cloud Database)
const db = getFirestore(app);

// Export db and app (auth is available via getFirebaseAuth() if needed)
export const getFirebaseAuth = getAuthInstance;
export { db };
export default app;