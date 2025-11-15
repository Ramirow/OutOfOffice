import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserService from '../services/UserService';

const AuthContext = createContext();

// Simple hash function (for demo - use bcrypt in production)
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// Check if password is already hashed (simple check)
const isPasswordHashed = (password) => {
  // Hashed passwords are hex strings, plain text passwords are not
  return /^[a-f0-9]+$/i.test(password) && password.length <= 10;
};

// Initial mock users for testing with roles
const INITIAL_MOCK_USERS = [
  { id: '1', email: 'demo@example.com', password: hashPassword('password123'), name: 'Demo User', role: 'regular' },
  { id: '2', email: 'admin@test.com', password: hashPassword('admin123'), name: 'Admin User', role: 'admin' },
  { id: '3', email: 'premium@demo.com', password: hashPassword('premium123'), name: 'Premium User', role: 'premium' },
  { id: '4', email: 'test@test.com', password: hashPassword('test123'), name: 'Test User', role: 'regular' },
];

const AUTH_STORAGE_KEY = '@OutOfOffice:auth';
// Note: Users are now stored in Firestore, not AsyncStorage

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved auth state and migrate initial users on app start
  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize app: load auth state and migrate initial users to Firestore
  const initializeApp = async () => {
    try {
      // Migrate initial mock users to Firestore (one-time operation)
      await UserService.migrateInitialUsers(INITIAL_MOCK_USERS);
      
      // Load saved auth state
      await loadAuthState();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuthState = async () => {
    try {
      // Load session from AsyncStorage (for quick access)
      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Verify user still exists in Firestore and get latest data
        const firestoreUser = await UserService.getUserById(parsedUser.id);
        if (firestoreUser) {
          // Remove password from user object
          const { password, ...userWithoutPassword } = firestoreUser;
          setUser(userWithoutPassword);
          // Update AsyncStorage with latest data
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        } else {
          // User deleted from Firestore, clear session
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  };

  const login = async (email, password) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hash the input password for comparison
    const hashedPassword = hashPassword(password);
    
    // Get user from Firestore
    const foundUser = await UserService.getUserByEmail(email);
    
    if (foundUser) {
      // Check password - support both hashed and plain text during transition
      let passwordMatches = false;
      if (isPasswordHashed(foundUser.password)) {
        passwordMatches = foundUser.password === hashedPassword;
      } else {
        // Legacy plain text password support
        passwordMatches = foundUser.password === password;
        // Update to hashed version if it was plain text
        if (passwordMatches) {
          await UserService.updateUser(foundUser.id, { password: hashedPassword });
        }
      }

      if (passwordMatches) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = foundUser;
        
        // Save to AsyncStorage for quick access
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        
        // Update state
        setUser(userWithoutPassword);
        
        return { success: true, user: userWithoutPassword };
      }
    }
    
    throw new Error('Invalid email or password');
  };

  const register = async (email, password, name) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists in Firestore
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate new user ID
    const newUserId = Date.now().toString();
    
    // Create new user with 'regular' role by default and hashed password
    const newUser = {
      id: newUserId,
      email: email.toLowerCase(),
      password: hashPassword(password),
      name: name,
      role: 'regular',
      image: null,
      age: '',
      career: '',
      study: '',
      hobby: '',
      bio: '',
      phone: '',
      location: '',
    };

    // Save to Firestore
    await UserService.createUser(newUser);

    // Remove password from user object before storing
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Save to AsyncStorage for quick access
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    
    // Update state
    setUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
  };

  const updateUserProfile = async (profileData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update in Firestore
    const result = await UserService.updateUser(user.id, profileData);
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = result.user;
    
    // Update AsyncStorage
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    
    // Update state
    setUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Debug function to reset users (for development)
  // Note: This only clears local session, Firestore users remain
  const resetUsers = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      // Re-migrate initial users to Firestore
      await UserService.migrateInitialUsers(INITIAL_MOCK_USERS);
      console.log('Session cleared and initial users re-migrated to Firestore');
    } catch (error) {
      console.error('Error resetting users:', error);
    }
  };

  // Helper functions to check user roles
  const isAdmin = () => user?.role === 'admin';
  const isPremium = () => user?.role === 'premium';
  const canAddEvents = () => user?.role === 'admin' || user?.role === 'premium';

  const value = {
    user,
    isLoading,
    login,
    register,
    updateUserProfile,
    logout,
    resetUsers, // For debugging
    isAuthenticated: !!user,
    isAdmin,
    isPremium,
    canAddEvents,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 