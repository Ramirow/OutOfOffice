import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
const USERS_STORAGE_KEY = '@OutOfOffice:users';

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
  const [mockUsers, setMockUsers] = useState(INITIAL_MOCK_USERS);

  // Load saved auth state and users on app start
  useEffect(() => {
    loadAuthState();
    loadUsers();
  }, []);

  const loadAuthState = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateUsersToHashedPasswords = (users) => {
    return users.map(user => ({
      ...user,
      password: isPasswordHashed(user.password) ? user.password : hashPassword(user.password)
    }));
  };

  const loadUsers = async () => {
    try {
      const savedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        // Migrate old plain text passwords to hashed format
        const migratedUsers = migrateUsersToHashedPasswords(parsedUsers);
        
        // Save the migrated users back to storage
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(migratedUsers));
        setMockUsers(migratedUsers);
        
        console.log('Users loaded and migrated successfully');
      } else {
        // First time app launch - save initial users
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_USERS));
        setMockUsers(INITIAL_MOCK_USERS);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to initial users
      setMockUsers(INITIAL_MOCK_USERS);
    }
  };

  const saveUsers = async (users) => {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setMockUsers(users);
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const login = async (email, password) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Hash the input password for comparison
    const hashedPassword = hashPassword(password);
    
    // Find user in mock data - support both hashed and plain text passwords during transition
    const foundUser = mockUsers.find(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        // Check if stored password is hashed or plain text
        if (isPasswordHashed(u.password)) {
          return u.password === hashedPassword;
        } else {
          // Legacy plain text password support
          return u.password === password;
        }
      }
      return false;
    });

    if (foundUser) {
      // If user had plain text password, update it to hashed version
      if (!isPasswordHashed(foundUser.password)) {
        const updatedUsers = mockUsers.map(u => 
          u.id === foundUser.id ? { ...u, password: hashedPassword } : u
        );
        await saveUsers(updatedUsers);
      }

      // Remove password from user object before storing
      const userWithoutPassword = { 
        id: foundUser.id, 
        email: foundUser.email, 
        name: foundUser.name,
        role: foundUser.role,
        // Include additional profile fields if they exist
        image: foundUser.image || null,
        age: foundUser.age || '',
        career: foundUser.career || '',
        study: foundUser.study || '',
        hobby: foundUser.hobby || '',
        bio: foundUser.bio || '',
        phone: foundUser.phone || '',
        location: foundUser.location || '',
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
      
      // Update state
      setUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (email, password, name) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate new user ID
    const newUserId = (mockUsers.length + 1).toString();
    
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

    // Add to mock users array and save persistently
    const updatedUsers = [...mockUsers, newUser];
    await saveUsers(updatedUsers);

    // Remove password from user object before storing
    const userWithoutPassword = { 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.name,
      role: newUser.role,
      image: newUser.image,
      age: newUser.age,
      career: newUser.career,
      study: newUser.study,
      hobby: newUser.hobby,
      bio: newUser.bio,
      phone: newUser.phone,
      location: newUser.location,
    };
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    
    // Update state
    setUser(userWithoutPassword);
    
    return { success: true, user: userWithoutPassword };
  };

  const updateUserProfile = async (profileData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find and update user in mock data
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      const updatedUsers = [...mockUsers];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        ...profileData,
      };
      await saveUsers(updatedUsers);
    }

    // Create updated user object without password
    const updatedUser = {
      id: user.id,
      email: profileData.email,
      name: profileData.name,
      role: user.role,
      image: profileData.image || null,
      age: profileData.age,
      career: profileData.career,
      study: profileData.study,
      hobby: profileData.hobby,
      bio: profileData.bio,
      phone: profileData.phone,
      location: profileData.location,
    };

    // Save to AsyncStorage
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
    
    return { success: true, user: updatedUser };
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
  const resetUsers = async () => {
    try {
      await AsyncStorage.removeItem(USERS_STORAGE_KEY);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setMockUsers(INITIAL_MOCK_USERS);
      setUser(null);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_USERS));
      console.log('Users reset successfully');
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